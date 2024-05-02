import 'package:flutter/material.dart';
import 'package:mobile/views/register_page.dart';

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.waving_hand,
              size: 100,
              color: Theme.of(context).colorScheme.onSecondaryContainer,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                style: Theme.of(context).textTheme.titleLarge,
                'Ciao Sconosciuto!',
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                style: Theme.of(context).textTheme.titleMedium,
                maxLines: 2,
                softWrap: false,
                'Accedi o registrati per usare tutte le funzionalità.',
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  FilledButton.icon(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                        builder: (BuildContext context) => const RegisterPage(),
                      ),
                    ),
                    icon: const Icon(Icons.person_add),
                    label: const Text('Registrati'),
                  ),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.login),
                    label: const Text('Accedi'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
