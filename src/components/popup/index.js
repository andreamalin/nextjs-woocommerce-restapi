import { useContext } from "react";
import Loader from "./loader";
import { AppContext } from "../context";

const PopUp = ({ 
    primaryText, 
    secondaryText, 
    terciaryText, 
    quaternaryText,
    primaryButtonFunction, 
    secondaryButtonFunction,
    primaryButtonText,
    secondaryButtonText,
    icon,
    showPayments,
    showLoader,
    isPrinter,
    paymentMethod,
    userIsInactive
}) => {
    const [ cart, setCart ] = useContext( AppContext );
	const { totalPrice, cartItems } = cart || {};

	return (
        <div className="popup-background" style={userIsInactive ? {zIndex: 3} : {}}>
            <div className="popup-container">
                <h5>{quaternaryText}</h5>
                <h1>{primaryText}</h1>
                <h2>{secondaryText}</h2>

                
                { icon && 
                    <div className="image-container">
                        { showLoader && <Loader /> }
                        { isPrinter && 
                            <div className="order-container">
                                <h3>Orden No.</h3>
                                <h1>1</h1>
                                <h6>Total:  {cartItems?.[0]?.currency ?? ''}{ totalPrice.toFixed(2) }</h6>
                            </div>
                        }
                        <div className={`image image-${icon}`} /> 
                    </div>
                }

                {
                    showPayments &&
                    <div className="payment-methods">
                        <button className="payment" onClick={() => paymentMethod()}>
                            <div className="icon icon-card" />
                            <h4>Tarjeta débito/crédito</h4>
                        </button>
                        <button className="payment" onClick={() => paymentMethod()}>
                            <div className="icon icon-cash" />
                            <h4>Efectivo</h4>
                        </button>
                    </div>
                }

                <h1>{terciaryText}</h1>

                
                { primaryButtonText && <button className="primary-button" onClick={() => primaryButtonFunction()}>{primaryButtonText}</button> }
                { secondaryButtonText && <button className="outline-button"  onClick={() => secondaryButtonFunction()}>{secondaryButtonText}</button> }
            </div>
        </div>
	)
}

export default PopUp;