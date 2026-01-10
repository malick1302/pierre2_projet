import React from 'react';

import Navbar from '../components/Navbar.jsx';

const About = () => {
    return (
        <div className="w-full h-full overflow-hidden scrollbar-hide" style={{ backgroundColor: '#F6F6F6' }}>
            <Navbar />
            <div className='font-HelveticaNeue font-light text-[16px] md:text-[26px] mt-[60px]'>
            <p> <span className='font-medium'>ROAR</span> is a Paris-based studio crafting music and sound design for brands, fashion and film. <br></br>
            Past clients insclude Converse, Ad Council, Giveon, the Kansas City Chiefs and more.</p>
            <p>Contact: <br></br> Pierre Ronin, Aristide Rosier <br></br> hello@roar-sound.com</p>
            </div>
        </div>
    );
};

export default About;
