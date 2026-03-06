export default function TradingDashboard() {
  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-lg font-bold text-gray-100">交易记录</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center space-y-3">
        <div className="text-gray-500 text-4xl">📊</div>
        <p className="text-gray-400 text-sm font-medium">NT 模拟盘数据待接入</p>
        <p className="text-gray-600 text-xs">
          NautilusTrader testnet 集成完成后，将自动显示账户余额、持仓、交易记录和净值曲线。
        </p>
      </div>
    </div>
  )
}
