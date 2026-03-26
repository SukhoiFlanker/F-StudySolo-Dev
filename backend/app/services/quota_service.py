"""User resource quota computation.

Single source of truth for all tier-based limits and addon calculations.
Used by workflow.create_workflow to enforce hard limits, and by
/api/usage/quota to expose quota data to the frontend.
"""

from fastapi import HTTPException, status
from supabase import AsyncClient

# Tier → max workflow count mapping (matches vip-01-membership-system-design.md §2.1)
TIER_WORKFLOW_LIMITS: dict[str, int] = {
    "free": 10,
    "pro": 50,
    "pro_plus": 200,
    "ultra": 9_999_999,  # Treated as unlimited in UI
}


async def get_workflow_quota(user_id: str, tier: str, db: AsyncClient) -> dict:
    """Compute workflow quota for a user.

    Returns:
        {
            "used": int,
            "base_limit": int,
            "addon_qty": int,
            "total_limit": int,
            "remaining": int,
        }
    """
    base = TIER_WORKFLOW_LIMITS.get(tier, 10)

    # Ultra users skip DB queries — they are unlimited
    if tier == "ultra":
        count_res = (
            await db.from_("ss_workflows")
            .select("id", count="exact", head=True)
            .eq("user_id", user_id)
            .execute()
        )
        used = count_res.count or 0
        return {
            "used": used,
            "base_limit": base,
            "addon_qty": 0,
            "total_limit": base,
            "remaining": base,
        }

    # Sum active, non-expired workflow addon quantities
    addon_res = (
        await db.from_("addon_purchases")
        .select("quantity")
        .eq("user_id", user_id)
        .eq("addon_type", "workflows")
        .eq("status", "active")
        .gt("expires_at", "now()")
        .execute()
    )
    addon_qty = sum(r["quantity"] for r in (addon_res.data or []))
    total = base + addon_qty

    # Count actual workflows via DB (service_role bypasses RLS for accuracy)
    count_res = (
        await db.from_("ss_workflows")
        .select("id", count="exact", head=True)
        .eq("user_id", user_id)
        .execute()
    )
    used = count_res.count or 0

    return {
        "used": used,
        "base_limit": base,
        "addon_qty": addon_qty,
        "total_limit": total,
        "remaining": max(0, total - used),
    }


async def assert_workflow_quota(user_id: str, tier: str, db: AsyncClient) -> None:
    """Raise HTTP 403 if the user has no remaining workflow slots.

    Call this before any ss_workflows INSERT to enforce hard quota limits.
    """
    if tier == "ultra":
        return  # Unlimited — skip check entirely

    quota = await get_workflow_quota(user_id, tier, db)
    if quota["remaining"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "WORKFLOW_QUOTA_EXCEEDED",
                "message": "工作流数量已达上限，请升级会员或购买增值包",
                "used": quota["used"],
                "total_limit": quota["total_limit"],
                "tier": tier,
            },
        )
