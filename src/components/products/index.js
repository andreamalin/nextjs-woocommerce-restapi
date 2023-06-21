import { isArray, isEmpty } from 'lodash';
import Product from './product';
import { AppContext } from '../context';
import { useContext } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';

const Products = ({ products }) => {
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty } = cart || {}; 
	const ref = useRef()
	
	if ( isEmpty( products ) || !isArray( products ) ) {
		return null;
	}

	useEffect(() => {
		if (ref.current) {
			ref.current.scrollTop = 0
		}
	}, [products])
	
	return (
		<div ref={ref} className={`flex max-h-75vh flex-wrap flex-shrink-0 flex-grow-0 w-4/5 overflow-y-scroll ${totalQty > 0 ? "" : "max-h-90vh"}`}>
			
			{ products.length ? products.map( product => {
				return (
					<Product key={ product?.id } product={product} />
				)
			} ) : null }
		
		</div>
	)
}

export default Products;
