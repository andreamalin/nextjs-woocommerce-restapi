
const PopUp = ({ 
    primaryText, 
    secondaryText, 
    terciaryText, 
    primaryButtonFunction, 
    secondaryButtonFunction,
    primaryButtonText,
    secondaryButtonText
}) => {
	return (
        <div className="popup-background">
            <div className="popup-container">
                <h1>{primaryText}</h1>
                <h2>{secondaryText}</h2>
                <div className="image image-clock" />

                <h1>{terciaryText}</h1>
                <button className="primary-button" onClick={() => primaryButtonFunction()}>{primaryButtonText}</button>
                <button className="outline-button"  onClick={() => secondaryButtonFunction()}>{secondaryButtonText}</button>
            </div>
        </div>
	)
}

export default PopUp;