import { isEmpty } from 'lodash';
import { addToCart } from '../../utils/cart';
import { useContext, useState } from 'react';
import { AppContext } from '../context';
import Link from 'next/link';
import cx from 'classnames';

const AddToCart = ( { product } ) => {
	
	const [ cart, setCart ] = useContext( AppContext );
	const { cartItems, totalPrice, totalQty } = cart || {};

	const [ isAddedToCart, setIsAddedToCart ] = useState( false );
	const [ loading, setLoading ] = useState( false );

	if ( isEmpty( product ) ) {
		return null;
	}
	
	return (
		<>
			<button
				className="cart-button"
				onClick={ () => addToCart( product?.id ?? 0, 1, setCart, setIsAddedToCart, setLoading ) }
				disabled={ loading }
			>
				{ loading ? 'Agregando...' : 'Agregar' }
			</button>
		</>
	);
};

export default AddToCart;
