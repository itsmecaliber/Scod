const Button = ({ children, onClick, type = "button", disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

export default Button;
