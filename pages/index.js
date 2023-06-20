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
import { useState } from 'react';

export default function Home({ headerFooter, productsInitial, categories }) {
	const [ products, setProducts ] = useState(productsInitial)
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

	const filterProducts = (categoryName) => {
		setProducts(productsInitial.filter(obj => obj.categories.some(category => category.name === categoryName)))
	}

	return (
		<>
		<div className="samsung-banner" />
		<Layout showHeader headerFooter={ headerFooter || {} } seo={ seo }>
			<VerticalNavbar categories={categories} filterProducts={ filterProducts } />
			<Products products={products} />
		</Layout>
		</>
	)
}

export async function getStaticProps() {
	
	const { data: headerFooterData } = await axios.get( HEADER_FOOTER_ENDPOINT );
	const { data: products } = await getProductsData();
	const { data: categories } = await getCategoriesData();

	
	return {
		props: {
			headerFooter: headerFooterData?.data ?? {},
			productsInitial: products ?? {},
			categories: categories ?? {}
		},
		
		/**
		 * Revalidate means that if a new request comes to server, then every 1 sec it will check
		 * if the data is changed, if it is changed then it will update the
		 * static file inside .next folder with the new data, so that any 'SUBSEQUENT' requests should have updated data.
		 */
		revalidate: 1,
	};
}
