describe('Testing the DOM manipulation of UploadExperiment.js', () => {

    beforeEach(() => {
        document.body.innerHTML = `
        <div id="loader" style="display: none;"></div>
        <div id="loader-text" style="display: none;"><p></p></div>
        <form action="/experiment/upload-experiment" id="exp-form" enctype="multipart/form-data" method="POST">
        </form>
        `;
        require('../public/js/UploadExperiment.js');
    });


    it('Testing loader', () => {
    
        let loader = document.getElementById('loader');

        window.dispatchEvent(new Event("beforeunload"));
        expect(loader.style.display).toBe('block');
    });

    it('Test loader text', () => {
    
        let loader_text = document.getElementById('loader-text');

        window.dispatchEvent(new Event("beforeunload"));
        expect(loader_text.style.display).toBe('block');
    });

    it('Testing form', () => {
    
        let form = document.getElementById('exp-form');

        window.dispatchEvent(new Event("beforeunload"));
        expect(form.style.display).toBe('none');
    });
});
