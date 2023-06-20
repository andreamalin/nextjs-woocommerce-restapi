/**
 * Internal Dependencies.
 */
import Products from '../src/components/products';
import { HEADER_FOOTER_ENDPOINT } from '../src/utils/constants/endpoints';

/**
 * External Dependencies.
 */
import axios from 'axios';
import { getCategoriesData, getProductsData } from '../src/utils/products';
import Layout from '../src/components/layout';
import VerticalNavbar from '../src/components/vertical-navbar';

export default function Home({ headerFooter, products, categories }) {
	const seo = {
		title: 'Next JS WooCommerce REST API',
		description: 'Next JS WooCommerce Theme',
		og_image: [],
		og_site_name: 'React WooCommerce Theme',
		robots: {
			index: 'index',
			follow: 'follow',
		},
	}
	return (
		<Layout headerFooter={ headerFooter || {} } seo={ seo }>
			<VerticalNavbar categories={categories} />
			<Products products={products} />
		</Layout>
	)
}

export async function getStaticProps() {
	
	const { data: headerFooterData } = await axios.get( HEADER_FOOTER_ENDPOINT );
	const { data: products } = await getProductsData();
	const { data: categories } = await getCategoriesData();

	
	return {
		props: {
			headerFooter: headerFooterData?.data ?? {},
			products: products ?? {},
			categories: categories.filter(
				o =>
				o.name != "Uncategorized"
			  ) ?? {}
		},
		
		/**
		 * Revalidate means that if a new request comes to server, then every 1 sec it will check
		 * if the data is changed, if it is changed then it will update the
		 * static file inside .next folder with the new data, so that any 'SUBSEQUENT' requests should have updated data.
		 */
		revalidate: 1,
	};
}
