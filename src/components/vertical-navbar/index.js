import { isArray, isEmpty } from 'lodash';
import { useState } from 'react';
import NavbarTab from './nav-tab';
import { useEffect } from 'react';
const VerticalNavbar = ({ categories, filterProducts }) => {
    const [clicked, setClicked] = useState("Home")

	useEffect(() => {
		console.log(clicked)
		filterProducts(clicked)
	}, [clicked])
	
	if ( isEmpty( categories ) || !isArray( categories ) ) {
		return null;
	}

	return (
		<div className="flex flex-col h-screen flex-shrink-0 flex-grow-0 w-1/5 vertical-nav-bg max-h-75vh">
			
			{ categories.length ? categories.map( category => {
				return (
					<NavbarTab tab={category} setClicked={setClicked} clicked={clicked} />
				)
			} ) : null }
		
		</div>
	)
}

export default VerticalNavbar;
