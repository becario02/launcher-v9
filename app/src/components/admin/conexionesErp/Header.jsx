export default function Header({ totalConnections }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <p className="text-[16px] text-[#92929D] dark:text-gray-400">
          Manage and assign ERP connections across your organization
        </p>
      </div>
      <div>
        <div className="flex items-center gap-2 border border-[#0080FF] text-[#0080FF] px-3 py-1 rounded-[6px] text-sm font-medium">
          <span>🔗</span>
          <span>{totalConnections} Total Connections</span>
        </div>
      </div>
    </div>
  );
}
