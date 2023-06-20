const images = [
    {
        name: "Home",
        normal: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/home.svg",
        clicked: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/home-blue.svg"
    },
    {
        name: "Galaxy Buds",
        normal: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/buds.svg",
        clicked: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/buds-blue.svg"
    },{
        name: "Phones",
        normal: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/phone.svg",
        clicked: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/phone-blue.svg"
    },{
        name: "TV",
        normal: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/tvs.svg",
        clicked: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/tvs-blue.svg"
    },{
        name: "Watches",
        normal: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/watch.svg",
        clicked: "https://wot-cdn-live-prod.s3.amazonaws.com/samsung/watch-blue.svg"
    }
]



const NavbarTab = ({ tab, clicked, setClicked }) => {
	return (
		<button type="button" onClick={() => setClicked(tab.name)} className={`flex tab items-center text-white ${clicked === tab.name ? "clicked-tab" : ""}`}>
            {
                clicked && tab.name == clicked ?
                <img src={images.find(x => x.name === clicked).clicked} />
                : 
                <img src={images.find(x => x.name === tab.name).normal} />
            }
            
            
            { tab.name }
		</button>
	)
}

export default NavbarTab;
