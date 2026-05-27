const Input = ({ label, error, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
            className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
        focus:ring-2 focus:ring-primary-500 focus:border-transparent
        ${error
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
            {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
)

export default Input