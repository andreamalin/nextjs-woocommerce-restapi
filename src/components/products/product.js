import Link from 'next/link';
import Image from '../image';
import { sanitize } from '../../utils/miscellaneous';
import AddToCart from '../cart/add-to-cart';
import { isEmpty } from 'lodash';
import ExternalLink from './external-link';

const Product = ( { product } ) => {
	
	if ( isEmpty( product ) ) {
		return null;
	}
	
	const img = product?.images?.[0] ?? {};
	const productType = product?.type ?? '';
	
	return (
		<div className="product-card">
			<Link href={ `/product/${ product?.slug }`} >
				<a>
					<Image
						sourceUrl={ img?.src ?? '' }
						altText={ img?.alt ?? ''}
						title={ product?.name ?? '' }
						width="380"
						height="380"
						layout="fill"
					/>
					<h6 className="font-bold uppercase my-2 tracking-0.5px">{ product?.name ?? '' }</h6>
					<div className="mb-4" dangerouslySetInnerHTML={{ __html: sanitize( product?.price_html ?? '' ) }}/>
				</a>
			</Link>
			
			<AddToCart product={product}/>
		</div>
	)
}

export default Product;
