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
import { useContext, useState } from 'react';
import { useEffect } from 'react';
import PopUp from '../src/components/popup';
import { useRef } from 'react';
import { clearCart } from '../src/utils/cart';
import { AppContext } from '../src/components/context';

let timer = null
export default function Home({ headerFooter, productsInitial, categories }) {
	const [ cart, setCart ] = useContext( AppContext );
	const [ products, setProducts ] = useState(productsInitial)

	const [ seconds, setSeconds ] = useState(false)
	const [ userIsInactive, setUserIsInactive ] = useState(false)
	const maximumInactiveSeconds = 20

    const handleUserInactivity = () => {
		setSeconds(0)
		setUserIsInactive(false)

		const handleTimeout = () => {
			setUserIsInactive(true)
			setSeconds(10)
		}
	
		clearTimeout(timer) // Cleaning timeout before starting new one
		timer = setTimeout(handleTimeout, maximumInactiveSeconds * 1000)
	  }

	const goBack = async () => {
		localStorage.clear()
		await clearCart( setCart, () => {} )
	}

	useEffect(() => {
		handleUserInactivity()
	}, [])

	useEffect(() => {
		document.addEventListener('click', handleUserInactivity)
		return () => {
			document.removeEventListener('click', handleUserInactivity)
		}
	}, [])

	useEffect(() => {
		let myInterval = null

		if (userIsInactive) {
			myInterval = setInterval(() => {
				if (seconds > 0) {
					setSeconds(seconds - 1);
				}
				if (seconds === 0) {
					clearInterval(myInterval)
					goBack()
				} 
			}, 1000)
		}

		return () => {
            clearInterval(myInterval);
		}
    }, [userIsInactive, seconds])

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
			{
				userIsInactive ? 
				<PopUp 
					primaryText="¡Oye!"
					secondaryText="¿Aún sigues ahí?"
					terciaryText={seconds} 
					primaryButtonText="Aquí sigo"
					secondaryButtonText="Cancelar orden"
					secondaryButtonFunction={() => goBack()}
					primaryButtonFunction={() => handleUserInactivity()} 
					icon="clock"
				/> : <></>
			}
			<div className="samsung-banner">
				<div className="wotdev-logo" />
			</div>
			<Layout showHeader headerFooter={ headerFooter || {} } seo={ seo }>
				<VerticalNavbar categories={categories} filterProducts={ filterProducts } />
				<Products handleUserInactivity={handleUserInactivity} products={products} />
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
