import React from 'react';

import Navbar from '../components/Navbar.jsx';

const About = () => {
    return (
        <div className="w-full h-full overflow-hidden scrollbar-hide" style={{ backgroundColor: '#F6F6F6' }}>
            <div className='text-grey-dark'><Navbar /></div>
            
            <div className='font-HelveticaNeue font-light text-[12px] md:text-[26px] mt-[18px] m-[18px] mt-[0px] text-grey-dark '>
            <p className='mb-[18px]'> <span className='font-medium'>ROAR</span> is a Paris-based studio crafting music and sound design for brands, fashion and film.
            Clients insclude Converse, Ad Council, Giveon, the Kansas City Chiefs and more.</p>
            <p>Contact: <br></br> Pierre Ronin, Aristide Rosier <br></br> hello@roar-sound.com <br></br> @instagram</p>
            </div>
        </div>
    );
};

export default About;
