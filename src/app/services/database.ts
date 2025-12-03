import { Injectable, signal, WritableSignal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { User } from '../interface/user';
import { MusicEvent } from '../interface/event';

@Injectable({
  providedIn: 'root',
})
export class Database {

  private USERS_KEY = 'MUSIC_MAP_USERS';
  private EVENTS_KEY = 'MUSIC_MAP_EVENTS'; // Nueva key para eventos

  private userSignal: WritableSignal<User[]> = signal([]);
  public currentUser: WritableSignal<User | null> = signal(null);

  // Signal para eventos
  public eventsSignal: WritableSignal<MusicEvent[]> = signal([]);

  constructor() {
    this.loadUsers();
    this.loadEvents(); // Cargar eventos al iniciar
  }

  // --- USUARIOS (Igual que antes) ---
  async loadUsers() {
    const { value } = await Preferences.get({ key: this.USERS_KEY });
    if (value) this.userSignal.set(JSON.parse(value));
  }

  private async saveUsersToStorage(users: User[]) {
    await Preferences.set({ key: this.USERS_KEY, value: JSON.stringify(users) });
    this.userSignal.set(users);
  }

  async addUser(newUser: Omit<User, 'id'>) {
    const currentUsers = this.userSignal();
    if (currentUsers.some(u => u.email === newUser.email)) throw new Error('EMAIL_EXISTS');
    const userWithId: User = { ...newUser, id: new Date().getTime() };
    await this.saveUsersToStorage([...currentUsers, userWithId]);
  }

  async findUser(email: string, password: string): Promise<User | null> {
    const foundUser = this.userSignal().find(u => u.email === email && u.password === password);
    if (foundUser) this.currentUser.set(foundUser);
    return foundUser || null;
  }

  logout() {
    this.currentUser.set(null);
  }

  // --- EVENTOS (NUEVO) ---

  async loadEvents() {
    const { value } = await Preferences.get({ key: this.EVENTS_KEY });
    if (value) {
      this.eventsSignal.set(JSON.parse(value));
    }
  }

  async addEvent(event: MusicEvent) {
    const currentEvents = this.eventsSignal();
    const updatedEvents = [...currentEvents, event];

    await Preferences.set({
      key: this.EVENTS_KEY,
      value: JSON.stringify(updatedEvents)
    });

    this.eventsSignal.set(updatedEvents);
  }

  async deleteEvent(eventId: number) {
    const currentEvents = this.eventsSignal().filter(e => e.id !== eventId);

    await Preferences.set({
      key: this.EVENTS_KEY,
      value: JSON.stringify(currentEvents)
    });

    this.eventsSignal.set(currentEvents);
  }

  get events() {
    return this.eventsSignal;
  }
}
