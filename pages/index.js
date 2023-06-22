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
import Link from 'next/link';

export default function Index() {
	return (
		<Layout>
			<div className="index">
				<div className="samsung-initial">
					<div className='samsung-wotdev-logo' />
				</div>
				{/*Home*/}
				<Link rel="noreferrer" target="_blank" href="/home">
					<a className="proceed-to-home">
						Toca para Ordenar
					</a>
				</Link>
			</div>
		</Layout>
	)
}

export async function getStaticProps() {
	return {
		props: {}
	};
}
