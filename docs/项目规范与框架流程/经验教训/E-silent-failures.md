# E. 静默吞错 (Silent Failures)

## E-01: except Exception: pass 吞掉一切
**根因**: 裸 except: pass 掩盖 RLS 拒绝、网络错误等真实异常
**修复**: 改为 except Exception as exc: logger.warning(...)
**防御规则**: 绝对禁止裸 except: pass，最少 logger.warning

## E-02: .catch(() => null) 吞掉前端 API 错误
**日期**: 2026-03-27
**根因**: fetchXxx().catch(() => []) 将 500 错误静默变为空数组，用户看到「暂无数据」
**修复**: 引入 FetchResult<T> 判别联合类型，分离「空列表」与「网络异常」
**防御规则**: 禁止 .catch(() => [])，错误必须以 toast/错误态反馈用户

## E-03: SKU 查找异常全部降级为默认值
**日期**: 2026-03-27
**根因**: 配置引用了不存在的 SKU，查找失败后 except: pass → 所有模型降级为 deepseek
**修复**: 启动时 validate_config_sku_references() 校验一致性
**防御规则**: 配置与数据的引用关系必须在启动时校验

## E-04: useEffect 无 .catch() 导致 Promise 挂起
**根因**: useEffect 中 fetchData() 返回 rejected promise 但无 .catch()
**修复**: useEffect(() => { fetchData().catch(err => setError(true)) }, [])
**防御规则**: useEffect 中的异步调用必须有 .catch() 兜底

## E-05: 回调链断裂 — 中间层未透传 props
**日期**: 2026-03-25
**根因**: 多层组件的回调 prop 在中间层 interface 未声明，静默断裂
**修复**: 在每一层 Props interface 中显式声明并透传回调
**防御规则**: 多层组件回调必须在每层 interface 显式声明，不能跳层
