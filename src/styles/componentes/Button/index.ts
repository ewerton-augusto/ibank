import styled from 'styled-components';

const ButtonStandard = styled.button`
  width: 100%;

  margin: 1rem 0;
  color: #fff;
  background-color: var(--primary-bg-color);
  border-radius: 25px;
  border: 0;
  padding: 1rem;
  font-weight: bold;
  font-size: 1rem;
  line-height: 1;
  text-transform: uppercase;
  outline: 0;
  transition: all 0.2s ease-in-out;

  cursor: pointer;
  &:hover,
  &:focus {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button-icon-posisiton {
    vertical-align: middle;
    margin: 0 5px;
  }

  &.modal-ok {
    width: 8rem;
  }

  &.modal-cancel {
    width: 8rem;
    background: red;
  }
`;

export default ButtonStandard;
