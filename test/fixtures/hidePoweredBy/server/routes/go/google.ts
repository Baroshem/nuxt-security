export default defineEventHandler(async event => {
  await sendRedirect(event, 'https://google.com');
});
