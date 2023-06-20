import Link from 'next/link';
import { useContext, useState } from 'react';
import { isEmpty } from 'lodash';

import { BurgerIcon, TailwindIcon, Bag, User, Wishlist } from '../../icons';
import { AppContext } from '../../context';
import { getPathNameFromUrl } from '../../../utils/miscellaneous';

const Header = ( { header } ) => {
	
	const [ cart, setCart ] = useContext( AppContext );
	const { headerMenuItems, siteDescription, siteLogoUrl, siteTitle } = header || {};

	console.log(cart)
	
	const [ isMenuVisible, setMenuVisibility ] = useState( false );
	
	return (
		<>
			<Link href="/cart">
				<a className="flex mt-4 lg:inline-block lg:mt-0 text-black hover:text-black mr-10">
				<span className="flex flex-row items-center lg:flex-col">
				<Bag className="mr-1 lg:mr-0"/>
					<span
						className="ml-1">Bag{ cart?.totalQty ? `(${ cart?.totalQty })` : null }</span>
				</span>
				</a>
			</Link>
		</>
	);
};

export default Header;
