import React, {Fragment} from 'react';
import { useState, useEffect } from 'react';

import {MapContainer, Marker, Popup, TileLayer, Polyline} from "react-leaflet";

import {Node} from "../../types";

import {DivIcon, DivIconOptions} from "leaflet";
import { Polyline as LeafletPolyline } from 'leaflet';
import { useMap } from 'react-leaflet';
import { LatLngExpression, PolylineOptions } from 'leaflet';
import 'leaflet.polyline.snakeanim/L.Polyline.SnakeAnim.js';
// import 'react-leaflet-fullscreen/dist/styles.css';
// const FullscreenControl = require("react-leaflet-fullscreen");
import { FullscreenControl } from 'react-leaflet-fullscreen';
interface Props {
    nodes: Node[];
}


declare module 'leaflet' {
    interface Polyline {
        snakeIn: (options?: { snakeSpeed: number }) => void;
    }
}

interface AnimatedPolylineProps {
    positions: LatLngExpression[];
    options: PolylineOptions;
    isAnimating: boolean; // Add this line
    setIsAnimating: (isAnimating: boolean) => void; // Add this line
}

const AnimatedPolyline = ({ positions, options, isAnimating, setIsAnimating  }: AnimatedPolylineProps) => {
    const map  = useMap();

    useEffect(() => {
        if (!map || isAnimating) return; // Add this line
        if(!positions) return;
        setIsAnimating(true);

        console.log('Positions:', positions);
        
        // Ensure all positions are valid
        const validPositions = positions.every(position => 
            Array.isArray(position) && 
            position.length === 2 && 
            typeof position[0] === 'number' && 
            typeof position[1] === 'number'
        );

        if (!validPositions) {
            console.error('Invalid positions:', positions);
            return;
        }


        const polyline = new LeafletPolyline(positions, options);
        polyline.addTo(map);
        polyline.snakeIn({snakeSpeed: 10});
        // When the animation is done, set isAnimating back to false
        polyline.on('snakeend', () => {
            setIsAnimating(false);
        });

        return () => {
            map.removeLayer(polyline);
        };
    }, [map, positions, options]);

    return null;
};

const NodeMap = (props: Props) => {
    const {nodes} = props;
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const center = {lat: 20.00, lng: 12.00};

    const publicCount = nodes.filter(x => x.location).length;
    const nodesWithNeighbors = nodes.filter(node => node.neighbors && node.neighbors.length > 0).length;

    const iconProps: DivIconOptions = {
        className: "map-marker-icon",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -20],
        html: "<img alt='Marker' src='/StacksLogo.png' />"
    }
    const icon = new DivIcon(iconProps);

    // Apply the blink animation if the node has neighbors
    const iconProps2: DivIconOptions = {
        className: "map-marker-icon transmit",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -20],
        html: "<img alt='Marker' src='/StacksLogo.png' />"
    }
    const icon2 = new DivIcon(iconProps2);

    return <div className="node-map">
        <div className="title">
            <img className="icon" /> &nbsp;
            {publicCount} public Stacks node (public ip address)
        </div>
        <div className="title">
            <img className="map-marker-icon icon2 transmit" /> &nbsp;
            {nodesWithNeighbors} publicly reachable Stacks nodes (port open for inbound connections)
        </div>
        <MapContainer center={center} zoom={2} className="the-map">
            {/* <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            /> */}
            {/* <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            /> */}
            {/* <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            /> */}
            <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
            {nodes.map((node, i) => {
                if (!node.location) {
                    return null;
                }

                // Determine if the node has neighbors
                const hasNeighbors = node.neighbors && node.neighbors.length > 0;

                // Search for nodes on same location
                const rNodes = nodes.filter(x => x.location && (x.location.lng === node.location!.lng && x.location.lat === node.location!.lat));

                return (<>
                <Marker 
                    icon={hasNeighbors ? icon2 : icon}
                    key={i} 
                    position={{lat: node.location.lat, lng: node.location.lng}}
                    eventHandlers={{
                        mouseover: () => setHoveredNode(node),
                        mouseout: () => setHoveredNode(null)
                    }}
                    // onMouseOver={() => setHoveredNode(node)}
                    // onMouseOut={() => setHoveredNode(null)}
                >
                    <Popup className="map-popup-content">
                        {rNodes.map((x, i) => {
                            if (!x.location) {
                                return null;
                            }

                            const {location, address} = x;
                            const {country, city} = location;
                            const href = `http://${address}:20443/v2/info`;

                            return <Fragment key={i}>
                                <p><strong>{country}</strong> {city && <> - {city}</>} </p>
                                <a href={href} rel="noreferrer" target="_blank">{address}</a>
                            </Fragment>
                        })}
                    </Popup>
                </Marker>
                
                {/* {node.neighbors.map((neighborAddress, j) => {
                const neighbor = nodes.find(n => n.address === neighborAddress);
                if (!neighbor || !neighbor.location || !node.location) {
                    return null;
                }

                return <Polyline className="neighbor-line" key={j} positions={[
                    [node.location.lat, node.location.lng],
                    [neighbor.location.lat, neighbor.location.lng]
                ]} />;
            })} */}
                {hoveredNode === node && node.neighbors.map((neighborAddress, j) => {
                        const neighbor = nodes.find(n => n.address === neighborAddress);
                        if (!neighbor || !neighbor.location || !node.location) {
                            return null;
                        }

                        // return <AnimatedPolyline key={j} positions={[
                        //     [node.location.lat, node.location.lng],
                        //     [neighbor.location.lat, neighbor.location.lng]
                        // ]} options={{ color: 'white' }} isAnimating={isAnimating} setIsAnimating={setIsAnimating} />;
                        return <Polyline key={j} positions={[
                            [node.location.lat, node.location.lng],
                            [neighbor.location.lat, neighbor.location.lng]
                        ]} color={'purple'} />;
                    })}
                </>
                );
            })}
            
            <FullscreenControl position="topright"/>
        </MapContainer>
    </div>
}

export default NodeMap;
