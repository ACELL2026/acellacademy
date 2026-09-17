export const THEME_COOKIE = 'yma_theme';

/** Inlined in <head> before paint to prevent a flash of the wrong theme. */
export const themeInitScript = `
(function(){try{
var m=document.cookie.match(/(?:^|; )yma_theme=([^;]*)/);
var t=m?decodeURIComponent(m[1]):null;
if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
document.documentElement.setAttribute('data-theme',t);
document.documentElement.style.colorScheme=t;
}catch(e){}})();
`.trim();
