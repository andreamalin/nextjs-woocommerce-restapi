import { isArray, isEmpty } from 'lodash';
import { useContext, useState } from 'react';
import NavbarTab from './nav-tab';
import { useEffect } from 'react';
import { AppContext } from '../context';
const VerticalNavbar = ({ categories, filterProducts }) => {
    const [clicked, setClicked] = useState("Home")
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty } = cart || {};

	useEffect(() => {
		filterProducts(clicked)
	}, [clicked])
	
	if ( isEmpty( categories ) || !isArray( categories ) ) {
		return null;
	}

	return (
		<div className={`flex flex-col h-screen flex-shrink-0 flex-grow-0 w-1/5 vertical-nav-bg max-h-75vh ${totalQty > 0 ? "" : "vertical-nav-bg-90vh"}`}>
			
			{ categories.length ? categories.map( category => {
				return (
					<NavbarTab tab={category} setClicked={setClicked} clicked={clicked} />
				)
			} ) : null }
		
		</div>
	)
}

export default VerticalNavbar;
