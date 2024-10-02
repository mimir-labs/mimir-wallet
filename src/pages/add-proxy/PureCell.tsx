// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material';

function PureCell() {
  return (
    <Box sx={{ width: '100%', border: '1px solid transparent' }}>
      <Typography marginBottom={1} fontWeight={700}>
        Proxied Account
      </Typography>
      <Box
        sx={{
          bgcolor: 'secondary.main',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 1,
          height: 56.8,
          fontWeight: 700
        }}
      >
        <svg xmlns='http://www.w3.org/2000/svg' width='30' height='31' viewBox='0 0 30 31' fill='none'>
          <circle cx='15' cy='15.5' r='15' fill='#2700FF' />
          <path
            d='M3.96937 20.0001C3.84937 20.0001 3.79737 19.9441 3.81337 19.8321L5.00137 12.3081C5.01737 12.1961 5.07337 12.1401 5.16937 12.1401H7.53337C8.52537 12.1401 9.24937 12.3321 9.70537 12.7161C10.1694 13.1001 10.4014 13.6881 10.4014 14.4801C10.4014 15.1041 10.2654 15.6441 9.99337 16.1001C9.72937 16.5561 9.34537 16.9081 8.84137 17.1561C8.33737 17.4041 7.72537 17.5281 7.00537 17.5281H6.10537L5.73337 19.8321C5.71737 19.9441 5.66137 20.0001 5.56537 20.0001H3.96937ZM6.36937 15.8481H7.08937C7.38537 15.8481 7.62937 15.8081 7.82137 15.7281C8.02137 15.6401 8.17337 15.5081 8.27737 15.3321C8.38137 15.1561 8.43337 14.9321 8.43337 14.6601C8.43337 14.3721 8.34537 14.1641 8.16937 14.0361C7.99337 13.9001 7.73337 13.8321 7.38937 13.8321H6.68137L6.36937 15.8481Z'
            fill='white'
          />
          <path
            d='M12.0631 20.1441C11.5191 20.1441 11.1311 19.9761 10.8991 19.6401C10.6751 19.2961 10.6191 18.7761 10.7311 18.0801L11.3431 14.1921C11.3591 14.0881 11.4191 14.0361 11.5231 14.0361H13.0711C13.1991 14.0361 13.2511 14.0881 13.2271 14.1921L12.6751 17.6361C12.6351 17.9401 12.6511 18.1601 12.7231 18.2961C12.7951 18.4321 12.9271 18.5001 13.1191 18.5001C13.3511 18.5001 13.5791 18.4281 13.8031 18.2841C14.0351 18.1321 14.2631 17.9481 14.4871 17.7321L14.4151 18.9321C14.2231 19.1161 14.0111 19.3041 13.7791 19.4961C13.5471 19.6801 13.2911 19.8361 13.0111 19.9641C12.7311 20.0841 12.4151 20.1441 12.0631 20.1441ZM14.3551 20.0001C14.2991 20.0001 14.2551 19.9881 14.2231 19.9641C14.1991 19.9321 14.1831 19.8881 14.1751 19.8321C14.1751 19.6961 14.1751 19.5561 14.1751 19.4121C14.1831 19.2601 14.1951 19.1041 14.2111 18.9441L14.1631 18.2001L14.7871 14.1921C14.7951 14.1441 14.8111 14.1081 14.8351 14.0841C14.8671 14.0521 14.9071 14.0361 14.9551 14.0361H16.5271C16.6391 14.0361 16.6871 14.0921 16.6711 14.2041L15.9871 18.4521C15.9551 18.7081 15.9271 18.9521 15.9031 19.1841C15.8791 19.4081 15.8591 19.6241 15.8431 19.8321C15.8351 19.9441 15.7751 20.0001 15.6631 20.0001H14.3551Z'
            fill='white'
          />
          <path
            d='M17.0796 20.0001C16.9676 20.0001 16.9196 19.9441 16.9356 19.8321L17.6076 15.5721C17.6476 15.3161 17.6796 15.0761 17.7036 14.8521C17.7276 14.6281 17.7476 14.4121 17.7636 14.2041C17.7636 14.0921 17.8196 14.0361 17.9316 14.0361H19.2636C19.3196 14.0361 19.3596 14.0481 19.3836 14.0721C19.4076 14.0961 19.4236 14.1361 19.4316 14.1921C19.4476 14.3281 19.4516 14.4761 19.4436 14.6361C19.4356 14.7881 19.4196 14.9441 19.3956 15.1041L19.4436 15.8721L18.8196 19.8321C18.8116 19.8801 18.7956 19.9201 18.7716 19.9521C18.7476 19.9841 18.7036 20.0001 18.6396 20.0001H17.0796ZM19.1916 16.6401L19.3116 15.0801C19.5036 14.8561 19.6956 14.6561 19.8876 14.4801C20.0796 14.2961 20.2836 14.1521 20.4996 14.0481C20.7236 13.9441 20.9596 13.8921 21.2076 13.8921C21.3836 13.8921 21.5076 13.9041 21.5796 13.9281C21.6276 13.9521 21.6556 13.9801 21.6636 14.0121C21.6716 14.0441 21.6716 14.0841 21.6636 14.1321C21.6396 14.3481 21.5996 14.6001 21.5436 14.8881C21.4956 15.1681 21.4436 15.4241 21.3876 15.6561C21.3556 15.7681 21.2916 15.8161 21.1956 15.8001C21.1476 15.7921 21.0916 15.7841 21.0276 15.7761C20.9636 15.7681 20.8836 15.7641 20.7876 15.7641C20.6436 15.7641 20.4796 15.7961 20.2956 15.8601C20.1116 15.9161 19.9236 16.0081 19.7316 16.1361C19.5476 16.2641 19.3676 16.4321 19.1916 16.6401Z'
            fill='white'
          />
          <path
            d='M24.1113 20.1441C23.2073 20.1441 22.5393 19.9081 22.1073 19.4361C21.6753 18.9641 21.5313 18.3041 21.6753 17.4561L21.8793 16.2681C22.0153 15.4601 22.3313 14.8641 22.8273 14.4801C23.3313 14.0881 24.0193 13.8921 24.8913 13.8921C25.6993 13.8921 26.3233 14.0321 26.7633 14.3121C27.2033 14.5841 27.4233 14.9761 27.4233 15.4881C27.4233 16.1281 27.2313 16.6041 26.8473 16.9161C26.4633 17.2281 25.8353 17.4281 24.9633 17.5161L23.5113 17.6601L23.4873 17.7801C23.4393 18.1001 23.4793 18.3401 23.6073 18.5001C23.7433 18.6521 23.9593 18.7281 24.2553 18.7281C24.5033 18.7281 24.7033 18.6881 24.8553 18.6081C25.0073 18.5201 25.0913 18.4041 25.1073 18.2601C25.1233 18.1481 25.1793 18.0921 25.2753 18.0921H26.7633C26.8833 18.0921 26.9353 18.1481 26.9193 18.2601C26.8713 18.6681 26.7313 19.0121 26.4993 19.2921C26.2753 19.5721 25.9633 19.7841 25.5633 19.9281C25.1633 20.0721 24.6793 20.1441 24.1113 20.1441ZM23.6793 16.5561L24.6633 16.4481C24.9593 16.4081 25.1713 16.3361 25.2993 16.2321C25.4353 16.1281 25.5033 15.9801 25.5033 15.7881C25.5033 15.6281 25.4433 15.5121 25.3233 15.4401C25.2113 15.3601 25.0353 15.3201 24.7953 15.3201C24.4833 15.3201 24.2393 15.3961 24.0633 15.5481C23.8873 15.7001 23.7753 15.9321 23.7273 16.2441L23.6793 16.5561Z'
            fill='white'
          />
        </svg>
        Pure Proxy
      </Box>
    </Box>
  );
}

export default PureCell;
