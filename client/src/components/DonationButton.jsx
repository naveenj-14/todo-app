const DonationButton = ({ amount, onAmountChange, onDonate, loading }) => {
  const presetAmounts = [50, 100, 500];

  return (
    <div className="donation-box">
      <p>Enjoying this Todo app?</p>
      <div className="donation-options">
        {presetAmounts.map((value) => (
          <button
            key={value}
            type="button"
            className={`chip-btn ${Number(amount) === value ? 'selected' : ''}`}
            onClick={() => onAmountChange(String(value))}
          >
            ₹{value}
          </button>
        ))}
      </div>

      <div className="donation-input-row">
        <input
          type="number"
          min="10"
          step="10"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="Custom amount"
        />
        <button type="button" className="primary-btn" onClick={onDonate} disabled={loading}>
          {loading ? 'Processing payment...' : 'Donate'}
        </button>
      </div>
    </div>
  );
};

export default DonationButton;
