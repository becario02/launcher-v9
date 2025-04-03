export default function HelpCenterCard() {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-full">
        <h3 className="font-semibold text-sm mb-2">Centro de ayuda</h3>
        <p className="text-xs text-gray-600">
          Lorem ipsum placerat mi tellus non ac risus facilisis nibh.
        </p>
        <div className="flex justify-end mt-2">
          <img
            src="https://source.unsplash.com/random/80x80/?support"
            alt="Centro de ayuda"
            className="w-10 h-10 rounded"
          />
        </div>
      </div>
    );
  }
  