import React, { useEffect, useState, useRef } from 'react';
import {isEmpty} from "lodash";
import Image from '../image';
import { deleteCartItem, updateCart } from '../../utils/cart';

const CartItem = ( {
	                   item,
	                   products,
	                   setCart
                   } ) => {
	
	const [productCount, setProductCount] = useState( item.quantity );
	const [updatingProduct, setUpdatingProduct] = useState( false );
	const [removingProduct, setRemovingProduct] = useState( false );
	const productImg = item?.data?.images?.[0] ?? '';

	useEffect(() => {
		setProductCount(item.quantity)
	}, [item.quantity])
	
	/**
	 * Do not allow state update on an unmounted component.
	 *
	 * isMounted is used so that we can set it's value to false
	 * when the component is unmounted.
	 * This is done so that setState ( e.g setRemovingProduct ) in asynchronous calls
	 * such as axios.post, do not get executed when component leaves the DOM
	 * due to product/item deletion.
	 * If we do not do this as unsubscription, we will get
	 * "React memory leak warning- Can't perform a React state update on an unmounted component"
	 *
	 * @see https://dev.to/jexperton/how-to-fix-the-react-memory-leak-warning-d4i
	 * @type {React.MutableRefObject<boolean>}
	 */
	const isMounted = useRef( false );
	
	useEffect( () => {
		isMounted.current = true
		
		// When component is unmounted, set isMounted.current to false.
		return () => {
			isMounted.current = false
		}
	}, [] )
	
	/*
	 * Handle remove product click.
	 *
	 * @param {Object} event event
	 * @param {Integer} Product Id.
	 *
	 * @return {void}
	 */
	const handleRemoveProductClick = ( event, cartKey ) => {
		event.stopPropagation();
		
		// If the component is unmounted, or still previous item update request is in process, then return.
		if ( !isMounted || updatingProduct ) {
			return;
		}
		
		deleteCartItem( cartKey, setCart, setRemovingProduct );
	};
	
	/*
	 * When user changes the qty from product input update the cart in localStorage
	 * Also update the cart in global context
	 *
	 * @param {Object} event event
	 *
	 * @return {void}
	 */
	const handleQtyChange = ( event, cartKey, type ) => {
		
		if ( process.browser ) {
			
			event.stopPropagation();
			let newQty;
			
			// If the previous cart request is still updatingProduct or removingProduct, then return.
			if ( updatingProduct || removingProduct || ( 'decrement' === type && 1 === productCount ) ) {
				return;
			}
			
			if ( !isEmpty( type ) ) {
				newQty = 'increment' === type ? productCount + 1 : productCount - 1;
			} else {
				// If the user tries to delete the count of product, set that to 1 by default ( This will not allow him to reduce it less than zero )
				newQty = ( event.target.value ) ? parseInt( event.target.value ) : 1;
			}
			
			// Set the new qty in state.
			setProductCount( newQty );
			
			if ( products.length ) {
				updateCart(item?.key, newQty, setCart, setUpdatingProduct);
			}
			
		}
	};
	
	return (
		<div className="cart-item-wrap grid grid-cols-3 gap-6 mb-5 border border-brand-bright-grey p-5">
			<div className="col-span-1 cart-left-col">
				<figure >
					<Image
						width="300"
						height="300"
						layout="fill"
						altText={productImg?.alt ?? ''}
						sourceUrl={! isEmpty( productImg?.src ) ? productImg?.src : ''} // use normal <img> attributes as props
					/>
				</figure>
			</div>
			
			<div className="col-span-2 cart-right-col">

				<div className="flex justify-between flex-col description-container">
					<div className="cart-product-title-wrap">
						<h3 className="cart-product-title text-brand-black">
							<p>{ item?.data?.name } </p>
						
						<button className="cart-remove-item  flex items-center leading-22px" onClick={ ( event ) => handleRemoveProductClick( event, item?.key ) }>
							<img src="https://wot-cdn-live-prod.s3.amazonaws.com/samsung/trash.svg" />
						</button>

						</h3>
						{item?.data?.description ? <p>{item?.data?.description}</p> : ''}
					</div>
					
					<footer className="cart-product-footer flex justify-between p-4">
						{/*Qty*/}
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<button className="decrement-btn" onClick={( event ) => handleQtyChange( event, item?.data?.cartKey, 'decrement' )} >
								<img src="https://wot-cdn-live-prod.s3.amazonaws.com/samsung/minus.svg" />
							</button>
							<p>{productCount}</p>
							<button className="increment-btn" onClick={( event ) => handleQtyChange( event, item?.data?.cartKey, 'increment' )}>
								<img src="https://wot-cdn-live-prod.s3.amazonaws.com/samsung/plus.svg" />
							</button>
						</div>
						
						{ updatingProduct ? <img className="cart-item-spinner" src="/cart-spinner.gif"  alt="spinner"/> : 
						<span className="cart-total-price">{item?.currency}{item?.line_subtotal?.toLocaleString()}</span> }
						
					</footer>
				</div>
			</div>
		</div>
	)
};

export default CartItem;
