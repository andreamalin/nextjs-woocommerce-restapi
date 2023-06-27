import React, { useState, useEffect } from 'react';
import { clearCart } from '../../utils/cart';
export const AppContext = React.createContext([
	{},
	() => {}
]);

export const AppProvider = ( props ) => {
	
	const [ cart, setCart ] = useState( null );
	
	/**
	 * This will be called once on initial load ( component mount ).
	 *
	 * Sets the cart data from localStorage to `cart` in the context.
	 */
	useEffect( async () => {
		
		if ( process.browser ) {
			let cartData = localStorage.getItem( 'next-cart' );
			cartData = null !== cartData ? JSON.parse( cartData ) : '';

			if (cartData == '') {
				await clearCart(setCart, () => {}, false)
			}
			setCart( cartData );
		}
		
	}, [] );
	
	/**
	 * 1.When setCart() is called that changes the value of 'cart',
	 * this will set the new data in the localStorage.
	 *
	 * 2.The 'cart' will anyways have the new data, as setCart()
	 * would have set that.
	 */
	useEffect( () => {

		if ( process.browser ) {
			localStorage.setItem('next-cart', JSON.stringify(cart));
		}

	}, [ cart ] );
	
	return (
		<AppContext.Provider value={ [ cart, setCart ] }>
			{ props.children }
		</AppContext.Provider>
	);
};
