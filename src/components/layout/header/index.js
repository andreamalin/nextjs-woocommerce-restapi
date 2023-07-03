import Link from 'next/link';
import { useContext, useState } from 'react';
import { isEmpty } from 'lodash';

import { BurgerIcon, TailwindIcon, Bag, User, Wishlist } from '../../icons';
import { AppContext } from '../../context';
import { getPathNameFromUrl } from '../../../utils/miscellaneous';
import CartItem from '../../cart/cart-item';
import { useRouter } from 'next/router';
import { clearCart } from '../../../utils/cart';

const Header = ( { header } ) => {
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty } = cart || {};
	const { headerMenuItems, siteDescription, siteLogoUrl, siteTitle } = header || {};
	const [ isClearCartProcessing, setClearCartProcessing ] = useState( false );
	
	const [ isMenuVisible, setMenuVisibility ] = useState( false );
	const router = useRouter()
	// Clear the entire cart.
	const handleClearCart = async ( event ) => {
		event.stopPropagation();
		
		if (isClearCartProcessing) {
			return;
		}
		
		await clearCart( setCart, setClearCartProcessing )
	};

	const handleGoToCart =  async ( event ) => {
		event.stopPropagation();
		document.location.href = "/cart.html"
	};
	
	return (
		<div className={`${cart?.totalQty ? "show-bottom-cart" : "hide-bottom-cart"}`}>
			<div className="content-wrap-cart">
				<div className="cart-layout-vertical">
					{/*Cart Items*/ }
					<div className="cart-items-layout">
						{ cartItems?.length &&
						cartItems.map( ( item ) => (
							<CartItem
								key={ item.product_id }
								item={ item }
								products={ cartItems }
								setCart={setCart}
							/>
						) ) }
					</div>
					
					{/*Cart Total*/ }
					<div className="cart-right-layout">
						<div className='total-price'>
							Total({totalQty}): <span>{cartItems?.[0]?.currency ?? ''}{ totalPrice?.toLocaleString() }</span>
						</div>

						{/*cart*/}
						<button className="go-to-cart" onClick={(event) => handleGoToCart(event)}>
							Ver carrito
						</button>

						{/*Clear entire cart*/}
						<button
							onClick={(event) => handleClearCart(event)}
							disabled={isClearCartProcessing}
							className='cancel'
						>
							<span className="woo-next-cart">{!isClearCartProcessing ? "Cancelar orden" : "Cancelando..."}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Header;
