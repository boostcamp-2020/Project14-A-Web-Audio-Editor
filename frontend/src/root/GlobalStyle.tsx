import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyles = createGlobalStyle`
    ${reset}
    *{
        margin: 0;
        padding: 0;
        border: 0;
        box-sizing:border-box;
    }
    html,
    body{
        width: 100%;
        height: 100%;
    }
    body{
        font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    }
    a{
        text-decoration:none;
        color:inherit;
        cursor: pointer;
    }
    ol, ul, li {
        list-style: none;
    }
    img {
        display: block;
        width: 100%;
        height: 100%;
        vertical-align: top;
    }
    input, button {
        background-color: transparent;
    }
    button {
        background: none;
        border: none;
        cursor: pointer;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
    }
    h1, h2, h3, h4, h5, h6 {
        font-family:'Maven Pro', sans-serif;
    }
    #root {
        width: 100%;
        height: 100%;
    }
`;

export default GlobalStyles;
