import { isPostSaved, removePost, savePost } from './logic'

export const favoriteLogic = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const saveButtons = document.querySelectorAll('button[data-saveid]')
    const saveIcon = `<svg width="13" height="21" viewBox="0 0 13 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8332 0.850875V0.348087L10.8389 0.850819L10.9098 0.850008C11.2681 0.851182 11.5939 0.977207 11.8204 1.17494C12.0433 1.36944 12.1463 1.60898 12.15 1.83348V19.1721L7.04825 14.8728L6.50054 14.4112L5.9528 14.8727L0.85 19.1723V1.91959L0.850939 1.83653C0.853487 1.61107 0.956377 1.37 1.18049 1.1745C1.40699 0.976922 1.73263 0.851049 2.09075 0.850007L2.15757 0.850813L2.15757 0.850875H2.16783H10.8292H10.8332Z" stroke="black" stroke-width="1.7"/>
</svg>`
    const deleteIcon = `<svg width="13" height="21" viewBox="0 0 13 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 1.8278V21L6.5005 15.5227L13 21V1.8278C12.9945 1.34151 12.7715 0.876763 12.3793 0.534527C11.9872 0.192291 11.4576 0.000206398 10.9057 2.27082e-09L10.8292 0.000874966H10.8332H2.16783L2.09533 2.27082e-09C1.54347 -2.41031e-05 1.01391 0.191866 0.621735 0.533963C0.229565 0.87606 0.00648809 1.34071 0.000993049 1.82692L0 1.8278Z" fill="#FF1850"/>
</svg>`

    if (saveButtons.length > 0) {
      saveButtons.forEach((button) => {
        const postId = button.getAttribute('data-saveid')

        button.innerHTML = isPostSaved(postId) ? deleteIcon : saveIcon

        button.addEventListener('click', (event) => {
          const postId = event.currentTarget.getAttribute('data-saveid')
          const postTitle = event.currentTarget.getAttribute('aria-label')

          if (isPostSaved(postId)) {
            removePost(postId)
            event.currentTarget.innerHTML = saveIcon
          } else {
            savePost(postId, postTitle)
            event.currentTarget.innerHTML = deleteIcon
          }
        })
      })
    }
  })
}

export default favoriteLogic
