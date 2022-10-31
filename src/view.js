class View {
    
    init() {
        this.input = document.querySelector('input');
        this.form = document.querySelector('form');
    }

    render(state) {
        if (state.form.valid) {
            this.input.style.border = null
        } else {
            this.input.style.border = '2px solid red'
        }
    }
};

export default View;