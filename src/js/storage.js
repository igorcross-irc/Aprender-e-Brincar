export class StorageManager {
  constructor() {
    this.SCORE_KEY = 'aprender_brincar_stars';
    this.CHILD_NAME_KEY = 'aprender_brincar_child_name';
  }

  getStars() {
    return parseInt(localStorage.getItem(this.SCORE_KEY) || '0', 10);
  }

  addStar() {
    const current = this.getStars() + 1;
    localStorage.setItem(this.SCORE_KEY, current.toString());
    return current;
  }

  resetStars() {
    localStorage.setItem(this.SCORE_KEY, '0');
    return 0;
  }

  getChildName() {
    return localStorage.getItem(this.CHILD_NAME_KEY) || 'Você';
  }

  setChildName(name) {
    localStorage.setItem(this.CHILD_NAME_KEY, name.trim() || 'Você');
  }
}