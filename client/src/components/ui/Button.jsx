const variants = {
    primary: 'bg-primary-700 hover:bg-primary-800 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
}

const Button = ({ children, variant = 'primary', loading, className = '', ...props }) => (
    <button
        className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
    >
        {loading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cargando...
            </span>
        ) : children}
    </button>
)

export default Button
