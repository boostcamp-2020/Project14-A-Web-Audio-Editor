import * as styledComponents from 'styled-components';
import { Theme } from './Theme';

const { default: styled, css, keyframes, ThemeProvider } = styledComponents as styledComponents.ThemedStyledComponentsModule<Theme>;

export { css, keyframes, ThemeProvider };
export default styled;
