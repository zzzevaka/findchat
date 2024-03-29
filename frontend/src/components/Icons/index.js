import React from 'react';
import classNames from 'classnames';
import InlineSVG from 'react-svg-inline';

import './icons.css';

const loader = `
    <svg version="1.1" viewBox="0 0 50 50">
        <path d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
            <animateTransform attributeType="xml"
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="0.6s"
                repeatCount="indefinite"
            />
        </path>
    </svg>
`;

const profile = `
    <svg viewBox="0 0 16 16">
        <g>
            <path d="M8.1,0L8.1,0C8.1,0,8,0,8.1,0C3.7,0,0.2,3.3,0,7.6c-0.1,2.2,0.7,4.3,2.2,5.9C3.7,15.1,5.7,16,7.9,16
                c0,0,0.1,0,0.1,0c4.3,0,7.9-3.5,8-7.8C16.1,3.7,12.6,0.1,8.1,0z M7.9,11.1c1.7-0.1,3.6,1,4.3,2.4c-2.4,1.9-6,1.9-8.3,0
                C4.3,12.5,5.8,11.2,7.9,11.1z M8,10.1C8,10.1,7.9,10.1,8,10.1c-2.1,0-3.9,1-5,2.7C1.8,11.7,1.1,10,1.1,8.2C1,6.4,1.7,4.6,3,3.2
                C4.3,1.8,6,1.1,7.9,1.1c1.9,0,3.8,0.7,5.1,2.2c1.3,1.3,1.9,3.1,1.9,5c-0.1,1.8-0.8,3.4-2,4.6C11.9,11.1,10,10.1,8,10.1z"/>
            <path d="M8,2.9C8,2.9,8,2.9,8,2.9c-0.9,0-1.7,0.3-2.3,1C5.1,4.5,4.8,5.3,4.8,6.1c0,1.8,1.5,3.2,3.2,3.2c0,0,0,0,0,0
                c1.8,0,3.2-1.5,3.2-3.2c0-0.9-0.3-1.7-1-2.3C9.7,3.2,8.8,2.9,8,2.9z M10.2,6.1c0,0.6-0.2,1.1-0.6,1.5C9.1,8.1,8.6,8.3,8,8.3h0
                c-1.2,0-2.2-1-2.2-2.2c0-0.6,0.2-1.1,0.6-1.5c0.4-0.4,1-0.6,1.5-0.6c0,0,0,0,0,0C9.2,4,10.2,4.9,10.2,6.1z"/>
        </g>
    </svg>
`;

const commentColor = `
    <svg viewBox="0 0 16 16">
        <style type="text/css">
            .st0{fill:url(#SVGID_1_);}
        </style>
        <g>
            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="-9.094947e-13" y1="8" x2="16" y2="8">
                <stop  offset="0" style="stop-color:#9A49BF"/>
                <stop  offset="5.611223e-02" style="stop-color:#A049BC"/>
                <stop  offset="0.6975" style="stop-color:#E146A1"/>
                <stop  offset="1" style="stop-color:#FA4596"/>
            </linearGradient>
            <path class="st0" d="M16,10.9c0,1-0.7,1.7-1.7,1.7c-0.6,0-1.1,0-1.7,0c-0.2,0-0.3,0.1-0.4,0.2c-0.3,0.5-0.6,1-0.9,1.5
                c-0.6,1-1.8,1-2.4,0c-0.3-0.5-0.7-1-1-1.5c-0.1-0.2-0.2-0.2-0.4-0.2c-1.9,0-3.9,0-5.8,0C0.9,12.6,0,12,0,10.9c0-2.7,0-5.5,0-8.2
                C0,1.6,0.7,1,1.8,1c4.2,0,8.3,0,12.5,0C15.3,1,16,1.6,16,2.7c0,1.4,0,2.7,0,4.1C16,8.2,16,9.6,16,10.9z M1.8,1.9
                C1.2,1.9,1,2.2,1,2.8c0,2.7,0,5.3,0,8c0,0.6,0.2,0.9,0.9,0.9c2,0,3.9,0,5.9,0c0.4,0,0.7,0.2,1,0.5c0.3,0.5,0.7,1.1,1,1.6
                c0.3,0.4,0.6,0.4,0.8,0c0.4-0.6,0.7-1.1,1.1-1.7c0.2-0.3,0.4-0.4,0.8-0.4c0.6,0,1.3,0,1.9,0c0.5,0,0.7-0.3,0.7-0.7
                c0-2.7,0-5.5,0-8.2c0-0.5-0.3-0.7-0.8-0.7c-2.1,0-4.2,0-6.2,0C5.9,1.9,3.9,1.9,1.8,1.9z"/>
        </g>
    </svg>
`;

const message = `
    <svg viewBox="0 0 16 16">
        <path d="M8,2.8c2,0,4.1,0,6.1,0c1.2,0,1.9,0.9,1.9,1.9c0,2.3,0,4.5,0,6.8c0,1.1-0.7,1.8-1.8,1.8c-4.1,0-8.2,0-12.3,0
                c-1.1,0-1.8-0.7-1.8-1.8c0-2.3,0-4.6,0-6.8c0-0.9,0.7-1.9,1.8-1.8C3.9,2.8,6,2.8,8,2.8z M8,3.7c-1.2,0-2.5,0-3.7,0
                c-0.8,0-1.7,0-2.5,0C1.2,3.7,0.9,4,0.9,4.6c0,0.2,0,0.3,0,0.5c0,0.2,0.1,0.4,0.3,0.5c1.9,1.3,3.8,2.6,5.7,4c0.8,0.6,1.3,0.6,2.1,0
                c1.8-1.3,3.7-2.6,5.5-3.8c0.4-0.3,0.5-0.5,0.5-1c0-0.8-0.3-1.1-1.1-1.1C12,3.7,10,3.7,8,3.7z M0.9,6.5c0,1.7,0,3.2,0,4.8
                c0,0.7,0.3,1,1,1c4.1,0,8.1,0,12.2,0c0.7,0,1-0.3,1-1c0-1.5,0-3.1,0-4.6c0-0.1,0-0.2,0-0.3c-0.1,0.1-0.2,0.1-0.3,0.2
                c-1.8,1.2-3.5,2.5-5.3,3.7c-1,0.7-2,0.7-2.9,0C4.8,9.2,3,8,1.2,6.7C1.2,6.7,1.1,6.6,0.9,6.5z"/>
    </svg>
`;

const search = `
    <svg viewBox="0 0 16 16">
        <path d="M4.3,10.8C3,9.2,2.6,7.4,2.9,5.4c0.3-1.7,1.2-3.1,2.5-4.1c2.7-2,6.4-1.7,8.8,0.8c2.2,2.3,2.4,6.1,0.4,8.6
			c-2,2.6-6.2,3.5-9.4,1C5.1,11.8,5,11.8,5,11.9c-1.3,1.3-2.6,2.6-3.9,3.9C0.9,16,0.6,16.1,0.4,16C0.1,15.9,0,15.7,0,15.4
			c0-0.2,0.1-0.4,0.3-0.6c1.3-1.3,2.6-2.6,3.8-3.8C4.2,11,4.2,10.9,4.3,10.8z M14.8,6.6c-0.1-3.1-2.5-5.4-5.6-5.4
			C6.3,1.3,4,3.8,4,6.7c0.1,3,2.5,5.3,5.4,5.3C12.4,11.9,14.8,9.5,14.8,6.6z"/>
    </svg>
`;

const settings = `
    <svg viewBox="0 0 16 16">
        <g>
            <path d="M8,16c-0.9,0.1-1.3-0.1-1.5-1.2c0-0.1,0-0.2-0.1-0.2c-0.2-0.9-0.2-0.9-1.1-1.2c-0.1,0-0.2,0-0.3,0
                c-0.3,0.2-0.7,0.4-1,0.6c-0.6,0.4-1.1,0.3-1.6-0.2c-0.1-0.1-0.3-0.3-0.4-0.4C1.6,13,1.5,12.6,1.8,12c0.2-0.4,0.5-0.8,0.7-1.2
                c0.2-0.3-0.1-1-0.4-1.1C1.7,9.7,1.3,9.6,0.9,9.5C0.3,9.3,0,9,0,8.3c0-0.2,0-0.4,0-0.6c0-0.6,0.3-1.1,1-1.2C1.3,6.4,1.7,6.4,2,6.2
                c0.1,0,0.3-0.2,0.4-0.3c0.3-0.5,0.2-0.9-0.1-1.3C2,4.3,1.8,4,1.7,3.6c-0.1-0.3,0-0.7,0.3-0.9c0.2-0.2,0.4-0.4,0.5-0.5
                c0.5-0.5,1-0.5,1.5-0.2c0.3,0.2,0.7,0.4,1,0.6c0.1,0.1,0.3,0.1,0.4,0C6,2.5,6.4,2,6.4,1.4c0-0.2,0.1-0.3,0.1-0.5
                C6.7,0.2,7,0,7.8,0c0.2,0,0.4,0,0.6,0C9,0,9.4,0.3,9.5,1c0,0.2,0.1,0.4,0.1,0.5c0,0.6,0.3,1,0.9,1.1c0.1,0,0.3,0,0.4,0
                c0.3-0.2,0.6-0.4,0.9-0.6c0.6-0.4,1.1-0.3,1.6,0.2c0.1,0.1,0.3,0.3,0.4,0.4c0.4,0.4,0.5,0.8,0.2,1.4c-0.2,0.4-0.4,0.7-0.7,1.1
                c-0.1,0.2-0.1,0.3,0,0.5c0.1,0.6,0.5,0.8,1.1,0.9C15.9,6.6,16,7,16,8.2c0,0.8-0.3,1.1-1,1.3c-0.2,0.1-0.4,0.1-0.6,0.1
                c-0.6,0-0.9,0.4-1,0.9c0,0.1,0,0.2,0,0.3c0.2,0.4,0.4,0.7,0.6,1c0.4,0.6,0.3,1-0.2,1.5c-0.1,0.1-0.3,0.3-0.4,0.4
                c-0.5,0.4-0.9,0.5-1.5,0.2c-0.3-0.2-0.6-0.4-1-0.6c-0.1-0.1-0.3-0.1-0.4,0c-0.6,0.1-0.8,0.5-0.9,1c0,0.1,0,0.1,0,0.2
                C9.4,15.8,9.1,16,8,16z M8,15.2c0.7,0,0.7,0,0.8-0.7C8.9,14.3,9,14.1,9,13.8c0-0.5,0.3-0.9,0.8-1c0.4-0.1,0.7-0.4,1-0.3
                c0.3,0,0.7,0.4,1,0.6c0.9,0.6,0.7,0.5,1.4-0.2c0.2-0.2,0.2-0.4,0.1-0.6c-0.2-0.4-0.4-0.7-0.6-1.1c-0.3-0.3-0.3-0.6-0.1-1
                c0.2-0.3,0.3-0.8,0.5-1C13.5,9,13.9,9,14.3,8.9c1-0.3,0.8-0.2,0.9-1.1c0-0.3-0.1-0.4-0.4-0.5c-0.3-0.1-0.7-0.2-1-0.2
                c-0.5,0-0.8-0.3-0.9-0.8c-0.1-0.4-0.4-0.7-0.4-1.1c0-0.4,0.4-0.7,0.6-1c0.5-0.8,0.5-0.8-0.2-1.4c-0.2-0.2-0.4-0.2-0.7-0.1
                C12,2.8,11.7,3,11.4,3.2c-0.4,0.4-0.8,0.4-1.3,0.1C9.8,3.1,9.4,3,9.2,2.8C9,2.5,9,2.1,8.9,1.7C8.7,0.6,8.7,0.8,7.7,0.8
                c-0.2,0-0.4,0.1-0.4,0.3c-0.1,0.3-0.2,0.7-0.3,1C7,2.7,6.6,2.9,6.1,3.2c-0.8,0.5-1.4,0.2-2-0.3C3.2,2.3,3.4,2.4,2.7,3.1
                C2.4,3.3,2.4,3.5,2.6,3.7C2.8,4.1,3.1,4.6,3.4,5c0.1,0.2,0.1,0.3,0,0.5C3.2,5.9,3.1,6.3,3,6.6C2.9,6.8,2.8,6.9,2.6,6.9
                C2.3,7,2,7.1,1.7,7.1C0.6,7.4,0.8,7.3,0.8,8.3c0,0.3,0.1,0.4,0.4,0.5C1.6,8.9,2,9,2.4,9.1C2.8,9.1,3,9.3,3.1,9.7
                c0.1,0.4,0.4,0.8,0.4,1.1c0,0.4-0.4,0.7-0.6,1.1c-0.6,1-0.5,0.7,0.2,1.4c0.2,0.2,0.4,0.2,0.6,0.1c0.4-0.3,0.9-0.6,1.3-0.8
                c0.1-0.1,0.3-0.1,0.4,0c0.4,0.2,0.8,0.3,1.2,0.5c0.1,0.1,0.2,0.2,0.3,0.3c0.1,0.4,0.2,0.8,0.3,1.2C7.4,15.2,7.4,15.2,8,15.2z"/>
            <path d="M8,4.8c1.8,0,3.2,1.4,3.2,3.2c0,1.8-1.5,3.2-3.2,3.2c-1.8,0-3.2-1.5-3.2-3.2C4.8,6.2,6.3,4.8,8,4.8z M8,10.4
                c1.3,0,2.4-1.1,2.4-2.4c0-1.3-1.1-2.4-2.5-2.4C6.7,5.6,5.6,6.7,5.6,8C5.6,9.3,6.7,10.4,8,10.4z"/>
        </g>
    </svg>
`;

export function LoaderIcon(props) {
    return <InlineSVG {...props} className='icon-loader' svg={loader} />
}

export function ProfileIcon(props) {
    return <InlineSVG {...props} svg={profile} />
}

export function MessageIcon(props) {
    return <InlineSVG {...props} svg={message} />
}
 
export function SearchIcon(props) {
    return <InlineSVG {...props} svg={search} />
}

export function SettingsIcon(props) {
    return <InlineSVG {...props} svg={settings} />
}

export function CommentColorIcon(props) {
    return <InlineSVG {...props} svg={commentColor} />
}

export function AddColorIcon({className, ...rest}) {
    return (
        <svg
            className={classNames('icon__add-color', className)}
            viewBox="0 0 16 16"
            {...rest}
        >
            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="16" y2="8">
                <stop  className='stop1' offset="0"/>
                <stop  className='stop2' offset="5.611223e-02"/>
                <stop  className='stop3' offset="0.6975"/>
                <stop  className='stop4' offset="1"/>
            </linearGradient>
            <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="3.9545" y1="7.9976" x2="12.0521" y2="7.9976">
                <stop  className='stop1' offset="0"/>
                <stop  className='stop2' offset="5.611223e-02"/>
                <stop  className='stop3' offset="0.6975"/>
                <stop  className='stop4' offset="1"/>
            </linearGradient>
            <g>
                <path className='gradient0' fill="url(#SVGID_1_)" d="M16,7.9c0.1,4.2-3.3,7.9-7.6,8.1C3.7,16.2,0.2,12.6,0,8.2C-0.1,4.2,3.1,0.1,7.8,0C12.1-0.1,15.9,3.2,16,7.9z
                    M8,1C4.1,1,1.2,4.1,1,7.7C0.9,11.9,4.3,15,8,15c3.8,0,6.9-3.1,6.9-6.9C15,4.2,11.9,1.1,8,1z"/>
                <path className='gradient1' fill="url(#SVGID_2_)" d="M8.4,7.6c1,0,1.9,0,2.8,0c0.5,0,0.8,0.2,0.8,0.5c0,0.3-0.3,0.5-0.8,0.5c-0.8,0-1.6,0-2.5,0
                    c-0.1,0-0.2,0-0.4,0c0,0.8,0,1.7,0,2.5c0,0.1,0,0.2,0,0.4c0,0.4-0.2,0.6-0.5,0.6c-0.3,0-0.5-0.2-0.5-0.6c0-0.8,0-1.6,0-2.4
                    c0-0.1,0-0.2,0-0.4c-0.9,0-1.7,0-2.5,0c-0.1,0-0.2,0-0.4,0C4.2,8.6,4,8.4,4,8.1c0-0.3,0.2-0.5,0.6-0.5c0.7,0,1.4,0,2,0
                    c0.3,0,0.5,0,0.8,0c0-0.2,0-0.4,0-0.6c0-0.8,0-1.6,0-2.4c0-0.4,0.2-0.6,0.5-0.6c0.3,0,0.5,0.2,0.5,0.6C8.4,5.6,8.4,6.5,8.4,7.6z"
                />
            </g>
        </svg>
    )
}

export function MarsIcon(props) {
    return (
        <svg {...props} viewBox="510.972 113.224 150.884 398.155">
            <g>
                <path d="M572.398,509.621c5.468-2.484,9.061-7.037,10.368-13.141c0.729-3.404,1.091-29.472,1.091-79.029V343.5h3h3
                v76.936c0,52.066,0.345,77.847,1.064,79.75c5.173,13.652,26.217,15.195,33.697,2.472l2.736-4.654l0.265-129.75l0.265-129.75h2.985
                h2.985v47.75c0.003,43.457,0.158,48.064,1.75,51.25c4.59,9.188,19.48,9.148,24.423-0.062c1.705-3.183,1.827-7.035,1.827-57.964
                c0-59.309-0.131-60.932-5.698-71.162c-3.501-6.432-12.013-14.333-18.776-17.431c-8.786-4.023-15.661-4.54-55.695-4.186
                c-35.418,0.312-37.625,0.441-43.104,2.499c-11.288,4.24-20.396,13.167-25.082,24.584c-2.093,5.097-2.149,6.562-2.418,62.72
                c-0.26,54.367-0.174,57.686,1.578,60.922c4.793,8.859,18.993,9.381,24.172,0.889c1.949-3.198,2.019-4.93,2.021-51.561l0.006-48.25
                h3.5h3.5v129.434c0,89.021,0.33,130.314,1.062,132.25c1.405,3.722,5.71,8.234,9.438,9.898
                C560.599,511.976,567.661,511.773,572.398,509.621z" />
                <path d="M594.146,177.013c22.726-5.919,31.935-31.77,18.103-50.815c-11.772-16.212-36.444-17.444-49.889-2.49
                c-11.158,12.411-11.27,31.499-0.247,43.455c5.051,5.479,9.006,7.916,15.824,9.75C584.955,178.798,587.238,178.812,594.146,177.013z
                "/>
        </g>
        </svg>
    )
}

export function LikeIcon(props) {
    return (
        <svg {...props} viewBox="0 0 16 16">
            <path d="M7.9,3.2c0.3-0.3,0.6-0.5,0.8-0.8c1.7-1.7,4.3-1.7,6-0.1c1.6,1.5,1.7,4.3,0.1,5.9c-2.1,2.2-4.2,4.3-6.4,6.4
			c-0.3,0.3-0.6,0.3-0.9,0c-2.2-2.2-4.4-4.3-6.5-6.6c-1.5-1.6-1.4-4.2,0.2-5.8c1.6-1.6,4.1-1.6,5.8-0.1C7.4,2.5,7.6,2.8,7.9,3.2z
			 M8,13.6c1.3-1.2,2.5-2.4,3.7-3.7c0.8-0.8,1.7-1.7,2.5-2.5c1.1-1.3,1-3.2-0.2-4.3c-1.3-1.2-3.1-1.2-4.3,0C9.2,3.4,8.9,3.8,8.5,4.1
			c-0.4,0.4-0.6,0.4-1,0C7.1,3.7,6.7,3.3,6.3,3c-0.6-0.5-1.3-0.8-2-0.8C3,2.1,1.9,2.9,1.3,4C0.8,5.2,1.1,6.6,1.9,7.5
			c1.9,2,3.9,3.9,5.9,5.9C7.9,13.5,7.9,13.5,8,13.6z
            "/>
        </svg>
    )
}

export function VenusIcon(props) {
    return (
        <svg {...props} viewBox="77.857 98.271 183 399.033">
            <g>
                <path d="M181.202,515.042c5.929-4.225,5.851-3.326,5.851-67.362v-58.532h4.5h4.5v58.766
                c0,66.748-0.368,63.636,8.074,68.051c7.478,3.908,14.995,1.989,20.364-5.199c2.021-2.705,2.066-3.943,2.335-62.188l0.272-59.428
                h19.978c10.987,0,19.977-0.272,19.977-0.607s-9.675-33.854-21.5-74.483c-11.825-40.632-21.5-74.108-21.5-74.392
                c0-0.285,1.546-0.518,3.433-0.518c2.404,0,3.591,0.523,3.955,1.75c0.287,0.962,6.203,20.854,13.146,44.203
                c6.94,23.352,13.481,43.661,14.533,45.137c2.813,3.954,9.118,6.207,13.819,4.941c6.07-1.635,10.115-7.145,10.115-13.775
                c0-5.097-29.113-101.066-32.318-106.537c-6.14-10.476-18.893-19.534-30.566-21.713c-7.033-1.312-50.281-1.301-57.225,0.015
                c-12.598,2.39-25.404,11.71-30.725,22.362c-2.945,5.899-32.166,102.067-32.166,105.864c0,8.067,5.924,13.744,14.35,13.75
                c4.158,0.003,5.322-0.468,8.154-3.299c3.752-3.753,3.692-3.579,19.577-57.447l10.396-35.25h3.33c2.705,0,3.229,0.328,2.801,1.75
                c-2.258,7.458-42.606,147.413-42.606,147.779c0,0.259,9,0.471,20,0.471h20v57.257c0,34.246,0.394,58.624,0.978,60.66
                c1.176,4.101,4.455,7.842,8.522,9.729C169.599,518.671,177.319,517.807,181.202,515.042z M199.553,182.792
                c7.484-1.994,10.694-3.982,16.249-10.059c5.984-6.548,8.25-12.45,8.258-21.513c0.006-9.732-2.396-15.467-9.496-22.661
                c-6.984-7.077-13.151-9.674-22.895-9.64c-12.714,0.044-24.016,7.352-29.393,19.008c-6.722,14.567-1.084,32.944,12.562,40.94
                C183.315,183.835,191.037,185.061,199.553,182.792z
                "/>
        </g>
        </svg>
    )
}



export function UpArrow(props) {
    return (
        <svg {...props} viewBox="0 0 284.929 284.929">
            <path d="M282.082,195.285L149.028,62.24c-1.901-1.903-4.088-2.856-6.562-2.856s-4.665,0.953-6.567,2.856L2.856,195.285
                C0.95,197.191,0,199.378,0,201.853c0,2.474,0.953,4.664,2.856,6.566l14.272,14.271c1.903,1.903,4.093,2.854,6.567,2.854
                c2.474,0,4.664-0.951,6.567-2.854l112.204-112.202l112.208,112.209c1.902,1.903,4.093,2.848,6.563,2.848
                c2.478,0,4.668-0.951,6.57-2.848l14.274-14.277c1.902-1.902,2.847-4.093,2.847-6.566
                C284.929,199.378,283.984,197.188,282.082,195.285z"/>
        </svg>
    );
}