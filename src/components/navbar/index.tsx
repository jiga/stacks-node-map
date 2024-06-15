import React from 'react';

import {Navbar, Nav} from "react-bootstrap";

import {openInNewSvg} from "../../svg";


const NavBar = () => {
    return <Navbar className="main-nav-bar" expand="md">
    <Navbar.Brand href="#home"><img
        src="/StacksLogo.png"
        alt="Logo"
        height="30"
        className="d-inline-block align-top"
        style={{marginLeft: '10px'}}
    /></Navbar.Brand>
    <Navbar.Text style={{color: "white"}}>Stacks Node Map</Navbar.Text>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
            <Nav.Link href="https://explorer.hiro.so/" target="_blank">Stacks Explorer {openInNewSvg}</Nav.Link>
            <Nav.Link href="https://www.stacks.co/" target="_blank">About Stacks {openInNewSvg}</Nav.Link>
        </Nav>
    </Navbar.Collapse>
</Navbar>
}

export default NavBar;
