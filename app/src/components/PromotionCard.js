export default function PromotionCard() {
    return (
      <div className="bg-gray-700 text-white p-4 rounded-lg shadow h-full">
        <h3 className="font-semibold text-sm mb-2">Promoción</h3>
        <p className="text-xs">
          Lorem ipsum placerat mi tellus non ac risus facilisis nibh.
        </p>
        <div className="flex justify-end mt-2">
          <img
            src="https://source.unsplash.com/random/80x80/?promotion"
            alt="Promoción"
            className="w-10 h-10 rounded"
          />
        </div>
      </div>
    );
  }
  