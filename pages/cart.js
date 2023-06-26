import Layout from '../src/components/layout';
import { HEADER_FOOTER_ENDPOINT } from '../src/utils/constants/endpoints';
import axios from 'axios';
import CartItemsContainer from '../src/components/cart/cart-items-container';
import PopUp from '../src/components/popup';
import { useEffect } from 'react';
import { useState } from 'react';

let timer = null
export default function Cart({ headerFooter }) {
	const [ seconds, setSeconds ] = useState(false)
	const [ userIsInactive, setUserIsInactive ] = useState(false)
	const maximumInactiveSeconds = 50

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

	const goBack = () => {
		document.location.href = "/"
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
				/> : <></>
			}
			<div className='banner-cart'>
				Revisar orden
			</div>
			<Layout headerFooter={{}}>
				<CartItemsContainer handleUserInactivity={handleUserInactivity} />
			</Layout>
		</>
	);
}

export async function getStaticProps() {
	
	const { data: headerFooterData } = await axios.get( HEADER_FOOTER_ENDPOINT );
	
	return {
		props: {
			headerFooter: headerFooterData?.data ?? {},
		},
		
		/**
		 * Revalidate means that if a new request comes to server, then every 1 sec it will check
		 * if the data is changed, if it is changed then it will update the
		 * static file inside .next folder with the new data, so that any 'SUBSEQUENT' requests should have updated data.
		 */
		revalidate: 1,
	};
}
