import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { FaArrowRight } from 'react-icons/fa'
import * as yup from 'yup';

import api from '../../../services/api';
import { ApplicationStore } from '../../../store';
import { change_screen, set_transaction_data } from '../../../store/dashboard/actions';
import getValidationErrors from '../../../utils/getValidationErrors';

import { FormCard } from '../../FormCard';
import Input from '../../Input';
import Button from '../../Button';

import { Contas, Plano } from '../../../types/dash-board';

interface PaymentsProps {
  func: Function;
}

const Payments: React.FC<PaymentsProps> = (props) => {
  const [destinatario, setDestinatario] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(0);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);
  
  const dispatch = useDispatch();

  const store = useSelector((state: ApplicationStore) => state.user);

  const handleSubmit = useCallback(async (dataProps: object) => {
    const date = new Date();
    const referenceDate = new Date(date.setDate(date.getDate() - 1));
    const depositDate = new Date(data);
    let stopApplication = false;

    if (destinatario.trim().length === 0) {
      toast.error('Login do destinatário não pode ser nulo');
      stopApplication = true;
    }
    if (referenceDate > depositDate || data === '') {
      toast.error('Escolha uma data válida');
      stopApplication = true;
    }
    if (descricao.length < 3) {
      toast.error('Descrição não pode ser nula');
      stopApplication = true;
    }
    if (valor <= 0) {
      toast.error('Valor para transferencia deve ser maior que 0');
      stopApplication = true;
    }

    setLoading(true);
    try {
      formRef.current?.setErrors({});

      const schema = yup.object().shape({
        receiver: yup.string().required('Login do destinatário obrigatório'),
        date: yup.string().required('Obrigatório data'),
        description: yup.string().min(3, 'Obrigatório descrição (min. 3 caracteres)'),
        transferValue: yup.string().required('Obrigatório transferência (max. 10000)'),
      });

      await schema.validate(dataProps, {
        abortEarly: false,
      });

      if (stopApplication) throw new Error('Erro ao tentar realizar pagamento');

      const [resultConta, resultPlan] = await Promise.all([
        api.get<Contas>(`/dashboard?fim=2021-02-22&inicio=2021-02-22&login=${store?.login}`, {
          headers: {
            Authorization: store?.token,
          }
        }),
        api.get<Plano[]>(`/lancamentos/planos-conta?login=${store?.login}`, {
          headers: {
            Authorization: store?.token,
          }
        })
      ])

      if (resultConta.data.contaBanco.saldo < valor) {
        toast.error('Saldo insuficiente.');
        return;
      }

      const { status } = await api.post('/lancamentos', {
        "conta": resultConta.data.contaBanco.id,
        "contaDestino": destinatario.trim(),
        "data": data,
        "descricao": descricao,
        "login": store?.login,
        "planoConta": resultPlan.data[3].id,
        "valor": valor,
      }, {
        headers: {
          Authorization: store?.token,
        }
      });

      if (status !== 200) throw new Error('Erro ao tentar realizar pagamento');

      dispatch(set_transaction_data(undefined))
      
      toast.success('Transferência realizada com sucesso.');
      clearForm();
      
      setLoading(false);
      dispatch(change_screen('transactions'));
    } catch (err) {
      setLoading(false);
      const errors = getValidationErrors(err);
      formRef.current?.setErrors(errors);

      if (err.response && err.response.status === 400)
        toast.error('Usuário não encontrado!');
    }
  }, [destinatario, data, descricao, valor, store?.login, store?.token, dispatch]);

  const clearForm = () => {
    setDestinatario('');
    setData('');
    setDescricao('');
    setValor(0);
  }
  const handleChangeValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const numberToAdd = Number(e.target.value);

    if (numberToAdd > 10000) setValor(10000);
    else setValor(numberToAdd);
  }, []);

  return (
    <>
      <FormCard>
        
        <Form ref={formRef} onSubmit={handleSubmit}>
          <h2>
            Informe os dados para realizar sua transferência
          </h2>

          <Input 
            name="receiver" 
            value={destinatario} 
            onChange={e => setDestinatario(e.target.value)} 
            type="text" 
            placeholder="Login do destinatário" 
          />
          <Input 
            name="date" 
            value={data} 
            onChange={e => setData(e.target.value)} 
            type="date" 
          />
          <Input 
            name="description" 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
            type="text" 
            placeholder="Descrição" 
          />
          <Input 
            name="transferValue" 
            value={valor ? valor : ''} 
            onChange={handleChangeValue} type="number" 
            placeholder="Qual o valor de sua transferência?" 
          />

          <Button 
            type='submit' 
            text={'Transferir agora'} 
            Icon={FaArrowRight}
            loading={loading}
          />

        </Form>

      </FormCard>
    </>
  );

}

export default Payments;