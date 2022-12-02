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
        elements.input.focus();
      }
    },
    success: {
      render: () => {
        clear();
        elements.input.focus();
        elements.form.reset();
        elements.feedback.classList.add("text-success");
        elements.feedback.textContent = messages.success;
      }
    },
    failed: {
      render: (err) => {
        clear();
        elements.input.classList.add("is-invalid");
        elements.feedback.classList.add("text-danger");
        elements.feedback.textContent = messages[err];
      }
    }
  }
};

export const renderText = (elements, i18next) => {
  const { form, button } = elements;
  const title = document.querySelector("#title");
  title.textContent = i18next.t(`title`);
  const subtitle = document.querySelector(".lead");
  subtitle.textContent = i18next.t(`subtitle`);
  const placeholder = form.querySelector('[for="url-input"]');
  placeholder.textContent = i18next.t(`placeholder`);
  const example = document.querySelector(".example");
  example.textContent = i18next.t(`example`);
  button.textContent = i18next.t(`button`);
};

export default () => (path, value) => {
  switch (path) {
    case "form.state":
      console.log(value);
      viewMachine.transitions[value].render();
      break;
    case "form.errors":
      viewMachine.transitions.failed.render(value);
      break;
    default:
      break;
  }
};
