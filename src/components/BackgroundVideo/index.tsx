import React from 'react';

import VideoBg from '../../assets/video/ibank.mp4';
import BgVideo from '../../styles/componentes/BackgroudVideo';

const BackgroundVideo: React.FC = () => {
    return (
        <>
            <BgVideo>
                <div className="wrapper__login">
                    <video autoPlay muted loop className="wrapper__video" id="wrapper__video">
                        <source src={VideoBg} type="video/mp4" />
                        Your browser does not support HTML5 video.
                    </video>
                    <div className="wrapper__h1">
                        <h1 className="h1__login">Peo<span className="h1-color1">p</span>le fi<span className="h1-color2">r</span>st.</h1>
                    </div>
                </div>
            </BgVideo>
        </>
    );
}

export default BackgroundVideo;