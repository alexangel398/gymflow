const Card = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
        {title && (
            <h3 className="text-base font-semibold text-gray-700 mb-4">{title}</h3>
        )}
        {children}
    </div>
)

export default Card