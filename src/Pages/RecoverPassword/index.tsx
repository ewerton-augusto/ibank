import { useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import * as yup from 'yup';

import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import { FaArrowRight } from 'react-icons/fa';

import Button from '../../components/Button';
import Input from '../../components/Input';
import Loader from '../../components/Loader';

import { Container } from '../../styles/pages/RecoverPassword';

const RecoverPassword: React.FC = () => {
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const formUsernameRef = useRef<FormHandles>(null);
  const formPasswordRef = useRef<FormHandles>(null);
  const history = useHistory();

  const handleSubmitUsername = useCallback(async (dataProps: object) => {
    setLoading(true);
    try {
      formUsernameRef.current?.setErrors({});

      const schema = yup.object().shape({
        username: yup.string().required('Nome de usuário obrigatório'),
      });

      await schema.validate(dataProps, {
        abortEarly: false
      });

      const { status, data } = await api.post('/nova-senha', {
        "email": 'email@email.com',
        "login": username,
      });

      if (status === 200 || status === 201) {
        setTemporaryPassword(data);
        setIsValidUsername(true);
      } else {
        history.push('/error-recover');
      }
    } catch (err) {
      const errors = getValidationErrors(err);
      formUsernameRef.current?.setErrors(errors);
      console.log(err);
      toast.error('Preencha com um usuário válido!');
      if (Object.keys(err).includes('isAxiosError')) {
        history.push('/error-recover');
      }
    } finally {
      setLoading(false);
    }
  }, [username, history]);

  const handleSubmitNewPassword = useCallback(async (dataProps: object) => {
    setLoading(true);

    try {
      formPasswordRef.current?.setErrors({});

      const schema = yup.object().shape({
        password: yup.string().min(6, 'No mínimo 6 digitos'),
        confirmPassword: yup.string().min(6, 'No mínimo 6 digitos'),
      });

      await schema.validate(dataProps, {
        abortEarly: false
      });

      if (password !== confirmPassword) {
        toast.error('As senhas devem ser iguais');
        return;
      }

      const data = await api.post(`altera-senha?senhaTemporaria=${temporaryPassword}`, {
        "senha": password,
        "usuario": username,
      });

      setLoading(false);
      if (data.status === 200 || data.status === 201) {
        toast.success('Senha alterada com sucesso');
        history.push('/login');
      } else {
        history.push('/error-recover');
      }
    } catch (err) {
      setLoading(false);
      const errors = getValidationErrors(err);
      formPasswordRef.current?.setErrors(errors);
      if (password.length < 6) {
        toast.error('As senhas devem ter um minimo de 6 caracteres');
      }
      if (password.length === 0 || confirmPassword.length === 0) {
        toast.error('Algum dos campos está inválido.');
      }
      if (Object.keys(err).includes('isAxiosError')) {
        toast.error('Ocorreu algum erro!');
        history.push('/error-recover');
      }
    } 
    // finally {
    //   setLoading(false);
    // }

  }, [username, password, confirmPassword, temporaryPassword, history]);

  return (
    <>
      <Container>
        {isValidUsername ? (
          <Form ref={formPasswordRef} onSubmit={handleSubmitNewPassword}>
            <header>
              <h2>Esqueci minha senha</h2>
              <p>Confirme seu nome de usuário e escolha uma nova senha</p>
            </header>

            <div className="has-animation">
              <Input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua nova senha" autoFocus />
              <Input name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme sua nova senha" />
            </div>

            {loading ? <Loader /> : <Button
              text="Enviar"
              Icon={FaArrowRight}
              type="submit"
            />}
          </Form>
        ) : (
            <Form ref={formUsernameRef} onSubmit={handleSubmitUsername} >
              <header>
                <h2>Esqueci minha senha</h2>
                <p>Confirme seu nome de usuário e escolha uma nova senha</p>
              </header>

              <div>
                <Input name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Confirme seu nome de usuário" autoFocus />
              </div>

              {loading ? <Loader /> : <Button
                text="Prosseguir"
                Icon={FaArrowRight}
                type="submit"
              />}
            </Form>
          )}
      </Container>
    </>
  );
}

export default RecoverPassword;