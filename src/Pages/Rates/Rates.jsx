import { useEffect, useState } from 'react';
import DropDown from '../../Components/DropDown';
import ProgressBar from '../../Components/ProgressBar';
import Loader from '../../Components/Loader';
import TextInput from '../../Components/TextInput';

import { useAnimationFrame } from '../../Hooks/useAnimationFrame';
import { ReactComponent as Transfer } from '../../Icons/Transfer.svg';

import classes from './Rates.module.css';

import CountryData from '../../Libs/Countries.json';
import countryToCurrency from '../../Libs/CountryCurrency.json';

const markUp = 0.0005;
let countries = CountryData.CountryCodes;

const Rates = () => {
  const [fromCurrency, setFromCurrency] = useState('AU');
  const [toCurrency, setToCurrency] = useState('US');

  const [exchangeRate, setExchangeRate] = useState(0.7456);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading] = useState(false);

  const [conversion1, setConversion1] = useState(undefined);
  const [conversion2, setConversion2] = useState(undefined);

  const onCurrencyChange = (value, setCurrency) => {
    const isNumber = /^\d*\.?\d*$/;
    if (isNumber.test(value)) {
      setCurrency(value)
    }
  }

  const Flag = ({ code }) => <img alt={code || ''} src={`/img/flags/${code || ''}.svg`} width="20px" className={classes.flag} />;

  const fetchData = async () => {
    try {
      if (!loading) {
        setLoading(true);
        const currency1 = countryToCurrency[fromCurrency];
        const currency2 = countryToCurrency[toCurrency];
        const result = await fetch(
          `https://rates.staging.api.paytron.com/rate/public/?sellCurrency=${currency1}&buyCurrency=${currency2}`,
          { method: 'GET' },
        );
        if (result) {
          const { retailRate } = await result.json();
          setExchangeRate(retailRate);
        }
      }
    } catch (e) {
      alert('An error has occurred');
    } finally {
      setLoading(false)
    }

  };

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!!conversion1) {
      const payTronRate = exchangeRate - (markUp * exchangeRate);
      const convertedRate = (conversion1 * payTronRate).toFixed(2);
      setConversion2(convertedRate);
    } else {
      setConversion2(undefined)
    }
  }, [conversion1, exchangeRate])

  useAnimationFrame(!loading, (deltaTime) => {
    setProgression((prevState) => {
      if (prevState > 0.998) {
        fetchData();
        return 0;
      }
      return (prevState + deltaTime * 0.0001) % 1;
    });
  });

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.heading}>Currency Conversion</div>
        <div className={classes.rowWrapper}>
          <div className={classes.conversionContainer}>
            <DropDown
              leftIcon={<Flag code={fromCurrency} />}
              label={'From'}
              selected={countryToCurrency[fromCurrency]}
              options={countries.map(({ code }) => ({ option: countryToCurrency[code], key: code, icon: <Flag code={code} /> }))}
              setSelected={(key) => setFromCurrency(key)}
            />
            <div>
              <TextInput
                label='Currency 1'
                onChange={(e) => onCurrencyChange(e, setConversion1)}
                value={conversion1}
              />
            </div>
          </div>

          <div className={classes.exchangeWrapper}>
            <div className={classes.transferIcon}>
              <Transfer height={'25px'} />
            </div>

            <div className={classes.rate}>{exchangeRate}</div>
          </div>

          <div className={classes.conversionContainer}>
            <DropDown
              leftIcon={<Flag code={toCurrency} />}
              label={'To'}
              selected={countryToCurrency[toCurrency]}
              options={countries.map(({ code }) => ({ option: countryToCurrency[code], key: code, icon: <Flag code={code} /> }))}
              setSelected={(key) => setToCurrency(key)}
            />
            <div>
              <TextInput
                label='Currency 2'
                value={conversion2}
              />
            </div>
          </div>
        </div>

        <ProgressBar progress={progression} animationClass={loading ? classes.slow : ''} style={{ marginTop: '20px' }} />

        {loading && (
          <div className={classes.loaderWrapper}>
            <Loader width={'25px'} height={'25px'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Rates;
