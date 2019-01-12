
function startWiki() {

    let userOptions = {
        global: {}
    }

    const Wiki = new SFE.Wiki(userOptions);

    Wiki.init();
}
startWiki();
