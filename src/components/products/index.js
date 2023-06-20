import { isArray, isEmpty } from 'lodash';
import Product from './product';

const Products = ({ products }) => {
	
	if ( isEmpty( products ) || !isArray( products ) ) {
		return null;
	}
	
	return (
		<div className="flex max-h-75vh flex-wrap flex-shrink-0 flex-grow-0 w-4/5 overflow-y-scroll">
			
			{ products.length ? products.map( product => {
				return (
					<Product key={ product?.id } product={product} />
				)
			} ) : null }
		
		</div>
	)
}

export default Products;
