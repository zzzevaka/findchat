import React from 'react';
import PhotoSwipe from 'photoswipe/dist/photoswipe.min.js';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
require('photoswipe/dist/photoswipe.css');
require('photoswipe/dist/default-skin/default-skin.css');

export function PhotoSwipeDummy(props) {
    return (
        <div className="pswp" tabIndex="-1" role="dialog" aria-hidden="true" id='pswp_dummy' {...props} >

            <div className="pswp__bg"></div>

            <div className="pswp__scroll-wrap">

                <div className="pswp__container">
                    <div className="pswp__item"></div>
                    <div className="pswp__item"></div>
                    <div className="pswp__item"></div>
                </div>

                <div className="pswp__ui pswp__ui--hidden">

                    <div className="pswp__top-bar">

                        <div className="pswp__counter"></div>

                        <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>

                        <button className="pswp__button pswp__button--share" title="Share"></button>

                        <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

                        <button className="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

                        <div className="pswp__preloader">
                            <div className="pswp__preloader__icn">
                            <div className="pswp__preloader__cut">
                                <div className="pswp__preloader__donut"></div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                        <div className="pswp__share-tooltip"></div> 
                    </div>

                    <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                    </button>

                    <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                    </button>

                    <div className="pswp__caption">
                        <div className="pswp__caption__center"></div>
                    </div>

                </div>

            </div>

        </div>
    );
}


export function PhotoSwipeImage({src, msrc, h, w, ...rest}) {

    return (
        <img
            src={msrc || src}
            data-w={w}
            data-h={h}
            data-fsrc={src}
            onClick={PhotoSwipeImage.onClick}
            alt=''
            {...rest}
        />
    );

}

PhotoSwipeImage.onClick = e => {
    e.preventDefault();
    const imgEl = e.target;
    const pswpDummy = document.getElementById('pswp_dummy');
    if (!imgEl || !pswpDummy) return;
    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
    const rect = imgEl.getBoundingClientRect(); 
    const options = {
        shareEl: false,
        fullscreenEl: false,
        history: false,
        getThumbBoundsFn: () =>  ({x: rect.left, y: rect.top + pageYScroll, w: rect.width}),
    }
    const items = [
        {
            src: imgEl.getAttribute('data-fsrc'),
            msrc: imgEl.getAttribute('src'),
            w: imgEl.getAttribute('data-w'),
            h: imgEl.getAttribute('data-h'),
            title: imgEl.getAttribute('alt'),
        },
    ];
    let pswp = new PhotoSwipe(
        pswpDummy,
        PhotoSwipeUI_Default,
        items,
        options
    );
    pswp.init();
}