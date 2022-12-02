export const elements = {
    form: document.querySelector(".rss-form"),
    input: document.getElementById("url-input"),
    button: document.querySelector('[aria-label="add"]'),
    feedback: document.querySelector(".feedback")
  };
  
  const messages = {
    url: "Ссылка должна быть валидным URL",
    notOneOf: "RSS уже существует",
    success: "RSS успешно загружен"
  };
  
  const clear = () => {
    elements.input.classList.remove("is-invalid");
    elements.feedback.classList.remove("text-danger");
    elements.feedback.classList.remove("text-success");
    elements.feedback.textContent = "";
  };
  
  const viewMachine = {
    transitions: {
      filling: {
        render: () => {
          clear();
          // elements.input.focus();
        }
      },
      success: {
        render: () => {
          clear();
          // elements.input.focus();
          elements.form.reset();
          elements.feedback.classList.add("text-success");
          elements.feedback.textContent = messages.success;
        }
      },
      failed: {
        render: () => {
          clear();
          elements.input.classList.add("is-invalid");
          elements.feedback.classList.add("text-danger");
          elements.feedback.textContent = 'Oops!'
        }
      }
    }
  };
  export default () => (path, value) => {
    switch (path) {
      case "form.state":
        viewMachine.transitions[value].render();
        break;
      case "form.errors":
        viewMachine.transitions.failed.render();
        break;
      default:
        break;
    }
  };
  